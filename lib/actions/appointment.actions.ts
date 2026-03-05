"use server";

import { prisma } from "@/db/prisma";
import { ServerActionResponse } from "@/types";
import { format, isAfter } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getAppTimeZone } from "../config";

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
}: getPendingAppointmentForDoctorProps): Promise<ServerActionResponse<PendingAppointmentProps>> {
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
    if (appointment.reservationExpiresAt && isAfter(now, appointment.reservationExpiresAt)) {
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