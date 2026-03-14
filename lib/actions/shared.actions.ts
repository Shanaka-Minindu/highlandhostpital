"use server";

import { prisma } from "@/db/prisma";
import { ServerActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export async function CancelAppointment(
  appointmentId: string,
): Promise<ServerActionResponse<null>> {
  try {
    // 1. Fetch the current appointment to check its status
    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      select: { status: true },
    });

    if (!appointment) {
      return {
        success: false,
        message: "Appointment not found.",
        errorType: "NOT_FOUND",
      };
    }

    // 2. Logic for BOOKING_CONFIRMED: Block update and return specific message
    if (appointment.status === "BOOKING_CONFIRMED") {
      return {
        success: false,
        message: "We are sorry. Please contact Highland Hospital to cancel this appointment",
        errorType: "CANCELATION_RESTRICTED",
      };
    }

    // 3. Logic for CASH: Update status to CANCELLED
    if (appointment.status === "CASH") {
      await prisma.appointment.update({
        where: { appointmentId },
        data: { status: "CANCELLED" },
      });

      // Revalidate paths to ensure UI reflects the new status
      revalidatePath("/user/profile"); // Adjust to your user dashboard path
      
      return {
        success: true,
        message: "Appointment cancelled successfully.",
      };
    }

    // 4. Default case: If status is anything else (COMPLETED, NO_SHOW, etc.), do nothing
    return {
      success: false,
      message: "This appointment cannot be cancelled in its current state.",
      errorType: "INVALID_STATUS",
    };

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      message: "An unexpected error occurred while cancelling the appointment.",
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}