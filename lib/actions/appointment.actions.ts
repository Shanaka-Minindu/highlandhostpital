"use server";

import { prisma } from "@/db/prisma";
import {
  AppointmentReservationParams,
  AppointmentSubmissionData,
  createGuestAppointmentProps,
  GuestAppointment,
  ReservationSuccessData,
  ServerActionResponse,
} from "@/types";
import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isSameSecond,
  parse,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { getAppTimeZone } from "../config";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { AppointmentStatus, PatientType, Prisma } from "../generated/prisma";
import { patientDetailsSchema } from "../validators";

interface PendingAppointmentProps {
  appointment: {
    appointmentId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  } | null;
}

interface getPendingAppointmentForDoctorProps {
  doctorId: string;
  userId: string;
}

export async function getPendingAppointmentForDoctor({
  doctorId,
  userId,
}: getPendingAppointmentForDoctorProps): Promise<
  ServerActionResponse<PendingAppointmentProps>
> {
  try {
    const timeZone = getAppTimeZone();
    const now = new Date();

    // 1. Only look for PAYMENT_PENDING.
    // Other statuses (CONFIRMED, etc.) are finalized and handled by a different view.
    const appointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        userId,
        status: "PAYMENT_PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!appointment) {
      return {
        success: true,
        message: "No pending reservations found.",
        data: { appointment: null },
      };
    }

    // 2. Check for expiration
    if (
      appointment.reservationExpiresAt &&
      isAfter(now, appointment.reservationExpiresAt)
    ) {
      // Logic: If expired, it's essentially 'Cancelled' or 'Void'
      return {
        success: true,
        message: "Reservation session expired.",
        data: { appointment: null },
      };
    }

    const zonedStart = toZonedTime(appointment.appointmentStartUTC, timeZone);
    const zonedEnd = toZonedTime(appointment.appointmentEndUTC, timeZone);

    return {
      success: true,
      message: "Active pending reservation found.",
      data: {
        appointment: {
          appointmentId: appointment.appointmentId,
          date: format(zonedStart, "yyyy-MM-dd"),
          startTime: format(zonedStart, "HH:mm"),
          endTime: format(zonedEnd, "HH:mm"),
          status: appointment.status,
        },
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to check reservations" };
  }
}

async function checkSlotAvailability(
  doctorId: string,
  startTime: Date,
  endTime: Date,
  currentAppointmentId?: string,
): Promise<boolean> {
  try {
    const now = new Date();

    // 1. Query for an existing appointment at the same time for this doctor
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentStartUTC: startTime,
        appointmentEndUTC: endTime,
        // Exclude the current appointment if we are updating/rescheduling
        NOT: currentAppointmentId
          ? { appointmentId: currentAppointmentId }
          : undefined,
      },
    });

    // 2. If no record exists, the slot is free
    if (!existingAppointment) {
      return true;
    }

    const { status, reservationExpiresAt } = existingAppointment;

    // 3. Logic: Check if the existing record blocks the slot

    // Scenario A: Slot is fully booked
    if (status === "BOOKING_CONFIRMED" || status === "CASH") {
      return false;
    }

    // Scenario B: Slot is in the "Pending" state (waiting for payment)
    if (status === "PAYMENT_PENDING") {
      // If there is no expiration set, assume it's still blocked
      if (!reservationExpiresAt) return false;

      // If current time is BEFORE the expiration, it's still blocked
      // (The reservation has not met/passed the current time yet)
      if (isAfter(new Date(reservationExpiresAt), now)) {
        return false;
      }

      // If we reached here, the status is PENDING but the time has EXPIRED.
      // Technically, this slot should be considered available.
      return true;
    }

    // Scenario C: If status is CANCELLED or anything else not handled above
    return true;
  } catch (error) {
    console.error("Error checking slot availability:", error);
    // In case of database error, safer to return false to prevent double booking
    return false;
  }
}

export async function createGuestAppointment({
  doctorId,
  startTime, // Expected as "HH:mm" (e.g., "09:30")
  endTime, // Expected as "HH:mm" (e.g., "10:00")
  date, // Expected as Date object or "yyyy-MM-dd"
}: createGuestAppointmentProps): Promise<
  ServerActionResponse<GuestAppointment>
> {
  try {
    const timezone = getAppTimeZone();

    // 1. Format the date part to a string (yyyy-MM-dd)
    const dateStr = format(new Date(date), "yyyy-MM-dd");

    // 2. Combine Date + Time and convert to UTC
    // This ensures "2024-05-20" + "09:30" becomes a specific moment in your Timezone
    const startTimeUTC = fromZonedTime(`${dateStr} ${startTime}`, timezone);
    const endTimeUTC = fromZonedTime(`${dateStr} ${endTime}`, timezone);

    // 3. Check Slot Availability
    const isAvailable = await checkSlotAvailability(
      doctorId,
      startTimeUTC,
      endTimeUTC,
    );

    if (!isAvailable) {
      return {
        success: false,
        message: "This time slot is no longer available.",
        errorType: "SLOT_TAKEN",
      };
    }

    // 4. Get Expiration duration from AppSettings
    const settings = await prisma.appSettings.findFirst({
      where: { id: "global" },
    });

    const reservationDuration = settings?.slotReservationDuration || 10;
    const reservationExpiresAt = addMinutes(new Date(), reservationDuration);

    // 5. Generate Guest Identifier and Create Record
    const guestIdentifier = uuidv4();

    const newAppointment = await prisma.appointment.create({
      data: {
        doctorId,
        userId: null,
        guestIdentifier,
        appointmentStartUTC: startTimeUTC,
        appointmentEndUTC: endTimeUTC,
        status: "PAYMENT_PENDING",
        reservationExpiresAt,
        patientName: "Guest Patient", // Placeholder
        patientType: "MYSELF",
      },
    });

    revalidatePath(`/doctors/${doctorId}`);

    return {
      success: true,
      message: "Slot reserved successfully.",
      data: {
        appointmentId: newAppointment.appointmentId,
        guestIdentifier: newAppointment.guestIdentifier as string,
      },
    };
  } catch (error) {
    console.error("Create Guest Appointment Error:", error);
    return {
      success: false,
      message: "Failed to reserve the slot.",
      error: error instanceof Error ? error.message : "Internal Error",
    };
  }
}

export async function createOrUpdateAppointment({
  date,
  doctorId,
  endTime, // Expected as "HH:mm"
  startTime, // Expected as "HH:mm"
  userId,
}: AppointmentReservationParams): Promise<
  ServerActionResponse<ReservationSuccessData>
> {
  try {
    // 1. Session and Security Check
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return {
        success: false,
        message: "Unauthorized access.",
        errorType: "UNAUTHORIZED",
      };
    }

    // 2. Timezone and Date Construction
    const timezone = getAppTimeZone();
    const dateStr = format(new Date(date), "yyyy-MM-dd");
    const newStartTimeUTC = fromZonedTime(`${dateStr} ${startTime}`, timezone);
    const newEndTimeUTC = fromZonedTime(`${dateStr} ${endTime}`, timezone);
    const now = new Date();

    // 3. Get Expiration Duration
    const settings = await prisma.appSettings.findFirst({
      where: { id: "global" },
    });
    const duration = settings?.slotReservationDuration || 10;
    const newExpiresAt = addMinutes(now, duration);

    // 4. Find Existing Pending Appointment for this user and doctor
    const existingPending = await prisma.appointment.findFirst({
      where: {
        doctorId,
        userId,
        status: "PAYMENT_PENDING",
        reservationExpiresAt: { gt: now }, // Must not be expired
      },
    });

    let targetAppointmentId: string;

    if (existingPending) {
      targetAppointmentId = existingPending.appointmentId;

      // Check if times are actually different
      const isSameTime =
        isSameSecond(
          new Date(existingPending.appointmentStartUTC),
          newStartTimeUTC,
        ) &&
        isSameSecond(
          new Date(existingPending.appointmentEndUTC),
          newEndTimeUTC,
        );

      if (!isSameTime) {
        // User is changing the slot - check if the NEW slot is available
        const isAvailable = await checkSlotAvailability(
          doctorId,
          newStartTimeUTC,
          newEndTimeUTC,
          targetAppointmentId, // Exclude current record from check
        );

        if (!isAvailable) {
          return {
            success: false,
            message: "The newly selected slot is no longer available.",
            errorType: "SLOT_TAKEN",
          };
        }
      }

      // Update the existing record (refreshes the expiry and sets new times)
      await prisma.appointment.update({
        where: { appointmentId: targetAppointmentId },
        data: {
          appointmentStartUTC: newStartTimeUTC,
          appointmentEndUTC: newEndTimeUTC,
          reservationExpiresAt: newExpiresAt,
        },
      });
    } else {
      // 5. Create New Appointment if no pending one exists
      const isAvailable = await checkSlotAvailability(
        doctorId,
        newStartTimeUTC,
        newEndTimeUTC,
      );

      if (!isAvailable) {
        return {
          success: false,
          message: "This slot is no longer available.",
          errorType: "SLOT_TAKEN",
        };
      }

      const newRecord = await prisma.appointment.create({
        data: {
          doctorId,
          userId,
          appointmentStartUTC: newStartTimeUTC,
          appointmentEndUTC: newEndTimeUTC,
          status: "PAYMENT_PENDING",
          reservationExpiresAt: newExpiresAt,
          patientName: session.user?.name || "Patient", // Default from user profile
          patientType: "MYSELF",
        },
      });
      targetAppointmentId = newRecord.appointmentId;
    }

    // 6. Cleanup and Return
    revalidatePath(`/doctors/${doctorId}`);

    return {
      success: true,
      message: "Slot reserved successfully.",
      data: { appointmentId: targetAppointmentId },
    };
  } catch (error) {
    console.error("Reservation Error:", error);
    return {
      success: false,
      message: "An error occurred while reserving your slot.",
      error: error instanceof Error ? error.message : "Internal Error",
    };
  }
}

export async function cleanUpReservedAppointment(): Promise<
  ServerActionResponse<undefined>
> {
  try {
    const now = new Date();

    // Perform a bulk delete of all appointments that meet the criteria
    const result = await prisma.appointment.deleteMany({
      where: {
        status: AppointmentStatus.PAYMENT_PENDING,
        reservationExpiresAt: {
          lt: now, // "Less than" current time means it has expired
        },
      },
    });

    return {
      success: true,
      message: `Successfully cleaned up ${result.count} expired reservations.`,
      data: undefined,
    };
  } catch (error) {
    console.error("Cleanup Error:", error);
    return {
      success: false,
      message: "Failed to clean up expired appointments.",
      error: error instanceof Error ? error.message : "Internal Server Error",
      errorType: "DATABASE_ERROR",
    };
  }
}

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    doctor: {
      include: {
        doctorProfile: true;
      };
    };
  };
}>;

export async function getAppointmentData({
  appointmentId,
}: {
  appointmentId: string;
}): Promise<ServerActionResponse<AppointmentWithRelations>> {
  try {
    // 1. Fetch the appointment with nested relations
    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      include: {
        doctor: {
          include: {
            doctorProfile: true,
          },
        },
      },
    });

    // 2. Check if appointment exists
    if (!appointment) {
      return {
        success: false,
        message: "Appointment session not found. It may have been cleared.",
        errorType: "NOT_FOUND",
      };
    }

    // 3. Check if the status is still Pending
    // If it's CONFIRMED or CASH, it shouldn't be edited in the patient-details flow
    if (appointment.status !== "PAYMENT_PENDING") {
      return {
        success: false,
        message: "This appointment is no longer in the pending state.",
        errorType: "INVALID_STATUS",
      };
    }

    // 4. Check if the reservation has expired
    if (appointment.reservationExpiresAt) {
      const now = new Date();
      const hasExpired = isBefore(
        new Date(appointment.reservationExpiresAt),
        now,
      );

      if (hasExpired) {
        return {
          success: false,
          message:
            "Your reservation session has expired. Please select the slot again.",
          errorType: "RESERVATION_EXPIRED",
        };
      }
    }

    // 5. Success
    return {
      success: true,
      message: "Appointment data retrieved successfully.",
      data: appointment as AppointmentWithRelations,
    };
  } catch (error) {
    console.error("Get Appointment Data Error:", error);
    return {
      success: false,
      message: "An error occurred while fetching appointment details.",
      error: error instanceof Error ? error.message : "Internal Error",
    };
  }
}

export async function updateGuestWithUser({
  guestIdentifier,
}: {
  guestIdentifier: string;
}): Promise<ServerActionResponse<{ appointmentId?: string }>> {
  try {
    // 1. Check if the session is available
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Session expired or user not authenticated. Please log in.",
        errorType: "UNAUTHORIZED",
      };
    }

    const currentUserId = session.user.id;

    // 2. Find data related to the guestIdentifier
    const appointment = await prisma.appointment.findFirst({
      where: { guestIdentifier },
    });

    if (!appointment) {
      return {
        success: false,
        message: "No appointment found for this session identifier.",
        errorType: "NOT_FOUND",
      };
    }

    // 3. Check if the reservation has expired
    if (appointment.reservationExpiresAt) {
      const now = new Date();
      const isExpired = isBefore(
        new Date(appointment.reservationExpiresAt),
        now,
      );

      if (isExpired) {
        return {
          success: false,
          message:
            "Your reservation time has expired. Please select a new slot.",
          errorType: "RESERVATION_EXPIRED",
        };
      }
    }

    // 4. Check if already have a userId related to that guestIdentifier
    if (appointment.userId) {
      return {
        success: false,
        message: "This appointment is already linked to a registered account.",
        errorType: "ALREADY_LINKED",
      };
    }

    // 5. Success Logic: Update the record
    const updatedAppointment = await prisma.appointment.update({
      where: { appointmentId: appointment.appointmentId },
      data: {
        userId: currentUserId,
        // Optional: you can clear guestIdentifier now that it's linked
        // guestIdentifier: null
      },
    });

    revalidatePath(`/doctors/${updatedAppointment.doctorId}`);

    return {
      success: true,
      message: "Appointment successfully linked to your account.",
      data: { appointmentId: updatedAppointment.appointmentId },
    };
  } catch (error) {
    console.error("Update Guest Error:", error);
    return {
      success: false,
      message: "An error occurred while linking your account.",
      error: error instanceof Error ? error.message : "Internal Error",
    };
  }
}

interface AppointmentData {
  appointmentId?: string;
}
export async function processAppointmentBooking(
  data: AppointmentSubmissionData,
): Promise<ServerActionResponse<AppointmentData>> {
  try {
    // 1. Validate Form Data with Zod
    const validation = patientDetailsSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Invalid patient details.",
        fieldErrors: validation.error.flatten().fieldErrors,
        errorType: "VALIDATION_ERROR",
      };
    }

    // 2. Auth Check
    const session = await auth();
    const currentUserId = session?.user?.id;
    if (!session || !currentUserId) {
      return {
        success: false,
        message: "Unauthorized access.",
        errorType: "UNAUTHORIZED",
      };
    }

    // 3. Time Handling (Convert App Time to UTC)
    const timezone = getAppTimeZone();
    const dateStr = format(new Date(data.date), "yyyy-MM-dd");
    const startTimeUTC = fromZonedTime(
      `${dateStr} ${data.startTime}`,
      timezone,
    );
    const endTimeUTC = fromZonedTime(`${dateStr} ${data.endTime}`, timezone);
    const now = new Date();

    // 4. Fetch Existing Appointment (Must match ID and current User)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        appointmentId: data.appointmentId,
        userId: currentUserId, // Matches Guest or Logged-in User
      },
    });

    // Determine if the existing record is still valid (Pending & Not Expired)
    const isStillValid =
      existingAppointment &&
      existingAppointment.status === "PAYMENT_PENDING" &&
      existingAppointment.reservationExpiresAt &&
      isAfter(new Date(existingAppointment.reservationExpiresAt), now);

    let finalAppointmentId: string;

    // 5. Logic: UPDATE vs CREATE
    if (isStillValid && existingAppointment) {
      // Scenario: Reservation is still active, just update details
      const updated = await prisma.appointment.update({
        where: { appointmentId: existingAppointment.appointmentId },
        data: mapFormDataToDb(data, currentUserId),
      });
      finalAppointmentId = updated.appointmentId;
    } else {
      // Scenario: Expired or Missing. Check slot availability for a fresh record
      const isAvailable = await checkSlotAvailability(
        data.doctorId,
        startTimeUTC,
        endTimeUTC,
        data.appointmentId, // Exclude the expired one from check
      );

      if (!isAvailable) {
        return {
          success: false,
          message:
            "The session expired and the slot was taken. Please select a new time.",
          errorType: "SLOT_EXPIRED_AND_TAKEN",
        };
      }

      // Get fresh expiry from settings
      const settings = await prisma.appSettings.findFirst({
        where: { id: "global" },
      });
      const expiryTime = addMinutes(
        now,
        settings?.slotReservationDuration || 10,
      );

      const newRecord = await prisma.appointment.create({
        data: {
          ...mapFormDataToDb(data, currentUserId),
          doctorId: data.doctorId,
          appointmentStartUTC: startTimeUTC,
          appointmentEndUTC: endTimeUTC,
          reservationExpiresAt: expiryTime,
          status: "PAYMENT_PENDING",
        },
      });
      finalAppointmentId = newRecord.appointmentId;
    }

    // 6. Cleanup and Revalidate
    revalidatePath(
      `/appointment/patient-details/appointmentId=${finalAppointmentId}`,
    );

    return {
      success: true,
      message: "Details saved successfully.",
      data: { appointmentId: finalAppointmentId },
    };
  } catch (error) {
    console.error("Process Booking Error:", error);
    return {
      success: false,
      message: "An error occurred while saving appointment details.",
      error: error instanceof Error ? error.message : "Internal Error",
    };
  }
}

/**
 * HELPER: Maps Zod/Form data to Prisma Model Fields
 */
function mapFormDataToDb(data: AppointmentSubmissionData, userId: string) {
  // Handle Date of Birth parsing if provided (from DD/MM/YYYY)
  let dob: Date | null = null;
  if (data.patientDateOfBirth) {
    dob = parse(data.patientDateOfBirth, "dd/MM/yyyy", new Date());
  }

  return {
    userId: userId,
    patientName: data.fullName,
    patientType: data.patientType, // "MYSELF" or "SOMEONE_ELSE"
    patientRelation: data.relationship || null,
    phoneNumber: data.useAlternatePhone ? data.phone : data.phone, // Logic based on your toggle
    reasonForVisit: data.reason,
    additionalNotes: data.notes || null,
    patientdateofbirth: dob,
  };
}
