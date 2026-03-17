/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  createGuestAppointment, 
  createOrUpdateAppointment 
} from "@/lib/actions/appointment.actions"; // Adjust import path
import { 
  ServerActionResponse, 
  GuestAppointment, 
  ReservationSuccessData 
} from "@/types";

interface HookProps {
  userId?: string;
  onConflict: () => void;
}

interface ReservationPayload {
  doctorId: string;
  date: string; // "yyyy-MM-dd"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export function useAppointmentReservation({ userId, onConflict }: HookProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const mutate = async (payload: ReservationPayload) => {
    startTransition(async () => {
        toast.dismiss();
      try {
        let response: ServerActionResponse<GuestAppointment | ReservationSuccessData>;

        // 1. Choose Server Action based on Auth state
        if (userId) {
          response = await createOrUpdateAppointment({
            ...payload,
            userId,
            // Convert strings back to Date objects as required by your Action props
            date: new Date(payload.date),
            startTime: payload.startTime as any, // Actions handle the HH:mm string conversion
            endTime: payload.endTime as any,
          });
        } else {
          response = await createGuestAppointment({
            ...payload,
            date: new Date(payload.date),
            startTime: payload.startTime as any,
            endTime: payload.endTime as any,
          });
        }

        // 2. Handle Success
        if (response.success && response.data) {
          toast.success(response.message || "Slot reserved!");

          const appointmentId = response.data.appointmentId;
          
          // Construct URL: /appointments/patient-details?appointmentId=xxx
          const baseUrl = "/appointments/patient-details";
          const params = new URLSearchParams({ appointmentId });

          // Add guestIdentifier to URL if it exists (Guest Flow)
          if ("guestIdentifier" in response.data) {
            params.append("guestIdentifier", response.data.guestIdentifier);
          }

          router.push(`${baseUrl}?${params.toString()}`);
        } 
        // 3. Handle Failure (Conflicts/Errors)
        else {
          toast.error(response.message || "Failed to reserve slot");
          
          // If the error is a slot conflict, trigger the refetch logic
          if (response.errorType === "SLOT_TAKEN") {
            onConflict();
          }
        }
      } catch (error) {
        console.error("Reservation Hook Error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return {
    isPending,
    mutate,
  };
}