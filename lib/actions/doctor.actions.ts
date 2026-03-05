"use server";
import { DoctorData, DoctorTopCard, ServerActionResponse } from "@/types";
import { prisma } from "@/db/prisma";
import { UserRole } from "@/lib/generated/prisma";
import {
  addMinutes,
  format,
  parse,
  startOfDay,
  endOfDay,
  isSameSecond,
  addDays,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { getAppTimeZone } from "../config";

export async function getOurDoctors(): Promise<
  ServerActionResponse<DoctorData[]>
> {
  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: UserRole.DOCTOR,
      },
      select: {
        id: true,
        name: true,
        image: true,
        doctorProfile: {
          select: {
            specialty: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    });

    // Flatten the data to match your DoctorData interface
    const formattedDoctors: DoctorData[] = doctors.map((doc) => ({
      id: doc.id,
      name: doc.name,
      imageUrl: doc.image ?? undefined,
      specialty: doc.doctorProfile?.specialty ?? "General",
      rating: doc.doctorProfile?.rating ?? 0,
      reviewCount: doc.doctorProfile?.reviewCount ?? 0,
    }));

    return {
      success: true,
      message: "Doctors fetched successfully",
      data: formattedDoctors,
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: "Failed to retrieve doctor list.",
      errorType: "FETCH_ERROR",
    };
  }
}

export async function getDoctorById(
  id: string,
): Promise<ServerActionResponse<DoctorTopCard>> {
  try {
    // 1. Fetch the user with their nested doctorProfile
    const doctor = await prisma.user.findUnique({
      where: {
        id: id,
        role: "DOCTOR", // Security check to ensure we only get doctors
      },
      include: {
        doctorProfile: true,
      },
    });

    // 2. Check if doctor exists and has a profile
    if (!doctor || !doctor.doctorProfile) {
      return {
        success: false,
        error: "Doctor not found or profile is incomplete.",
        errorType: "NOT_FOUND",
      };
    }

    // 3. Map the database result to the DoctorTopCard interface
    const formattedData: DoctorTopCard = {
      id: doctor.id,
      image: doctor.image,
      name: doctor.name,
      specialty: doctor.doctorProfile.specialty,
      brief: doctor.doctorProfile.brief,
      credentials: doctor.doctorProfile.credentials,
      languages: doctor.doctorProfile.languages,
      rating: doctor.doctorProfile.rating,
      reviewCount: doctor.doctorProfile.reviewCount,
      specializations: doctor.doctorProfile.specializations,
    };

    return {
      success: true,
      message: "Doctor details retrieved successfully",
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    return {
      success: false,
      error: "An error occurred while fetching doctor details.",
      errorType: "DATABASE_ERROR",
    };
  }
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  startTimeUTC: Date;
  endTimeUTC: Date;
}

interface getAvailableDoctorSlotsProps {
  currentUserId?: string;
  doctorId: string;
  date: string;
}



export async function getAvailableDoctorSlots({
  currentUserId,
  date,
  doctorId,
}: getAvailableDoctorSlotsProps): Promise<ServerActionResponse<TimeSlot[]>> {
  try {
    const selectedDate = new Date(date);
    const timezone = getAppTimeZone();
    const now = new Date();
    
    const isToday = format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    // 1. Fetch data. Note: We remove the 'status' filter to see ALL appointments
    const [leave, settings, appointments] = await Promise.all([
      prisma.doctorLeave.findFirst({
        where: { doctorId, leaveDate: startOfDay(selectedDate) },
      }),
      prisma.appSettings.findFirst({ where: { id: "global" } }),
      prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentStartUTC: { 
            gte: startOfDay(selectedDate),
            lt: addDays(startOfDay(selectedDate), 1) 
          },
        },
      }),
    ]);

    if (!settings) throw new Error("App settings not found");

    // 2. Determine Doctor Work Window
    let windowStart = settings.startTime;
    let windowEnd = settings.endTime;

    if (leave) {
      if (leave.leaveType === "FULL_DAY") return { success: true, message: "Doctor not available", data: [] };
      if (leave.leaveType === "AFTERNOON") windowEnd = "13:00";
      if (leave.leaveType === "MORNING") windowStart = "13:00";
    }

    // 3. Generate and Filter Slots
    const slotDuration = 60 / settings.slotsPerHour;
    const slots: TimeSlot[] = [];
    let currentSlotStart = parse(windowStart, "HH:mm", selectedDate);
    const endTimeLimit = parse(windowEnd, "HH:mm", selectedDate);

    while (currentSlotStart < endTimeLimit) {
      const currentSlotEnd = addMinutes(currentSlotStart, slotDuration);
      const startTimeUTC = fromZonedTime(currentSlotStart, timezone);
      const endTimeUTC = fromZonedTime(currentSlotEnd, timezone);

      // A. Past Time Filter
      const isPastSlot = isToday && startTimeUTC < now;

      // B. Appointment Status Logic
      // Find if there is an appointment at this specific time
      const existingAppt = appointments.find((appt) => 
        isSameSecond(new Date(appt.appointmentStartUTC), startTimeUTC)
      );

      let isAvailable = false;

      if (!existingAppt || existingAppt.status === "CANCELLED") {
        // Condition: CANCELLED or No entry -> Available for everyone
        isAvailable = true;
      } else if (existingAppt.status === "PAYMENT_PENDING") {
        // Condition: PAYMENT_PENDING -> Only available to the owner
        isAvailable = existingAppt.userId === currentUserId;
      } else {
        // Condition: BOOKING_CONFIRMED, COMPLETED, NO_SHOW, CASH 
        // -> Not available for anyone
        isAvailable = false;
      }

      // Final Check: Slot must be in the future AND logically available
      if (!isPastSlot && isAvailable) {
        slots.push({
          startTime: format(currentSlotStart, "HH:mm"),
          endTime: format(currentSlotEnd, "HH:mm"),
          startTimeUTC,
          endTimeUTC,
        });
      }

      currentSlotStart = currentSlotEnd;
    }

    return { 
      success: true, 
      message: "Slots retrieved successfully", 
      data: slots 
    };
  } catch (error) {
    console.error("Slot Error:", error);
    return { success: false, error: "Failed to fetch slots", errorType: "FETCH_ERROR" };
  }
}