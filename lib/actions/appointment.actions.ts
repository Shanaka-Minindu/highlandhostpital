"use server";

import { prisma } from "@/db/prisma";
import {
  AppointmentReservationParams,
  createGuestAppointmentProps,
  GuestAppointment,
  ReservationSuccessData,
  ServerActionResponse,
} from "@/types";
import { addMinutes, format, isAfter, isSameSecond } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { getAppTimeZone } from "../config";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { AppointmentStatus } from "../generated/prisma";

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

export async function cleanUpReservedAppointment(): Promise<ServerActionResponse<undefined>> {
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