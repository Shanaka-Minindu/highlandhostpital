"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { getAvailableDoctorSlots } from "@/lib/actions/doctor.actions";
import { getPendingAppointmentForDoctor } from "@/lib/actions/appointment.actions";
import { TimeSlot } from "@/types";

export const useAppointmentSlots = (doctorId: string, userId?: string) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [initialTimeSlot, setInitialTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isMounted = useRef(true);
  const isInitialLoad = useRef(true); // Flag to coordinate the first fetch

  const fetchSlotsForDate = useCallback(
    async (selectedDate: Date) => {
      setIsLoading(true);
      try {
        const response = await getAvailableDoctorSlots({
          currentUserId: userId,
          doctorId,
          date: format(selectedDate, "yyyy-MM-dd"),
        });

        if (!isMounted.current) return;

        if (response.success && response.data) {
          setTimeSlots(response.data);
        } else {
          toast.error(response.message || "Failed to fetch available slots");
          setTimeSlots([]);
        }
      } catch (error) {
        if (isMounted.current) toast.error("An unexpected error occurred.");
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    },
    [doctorId, userId],
  );

  // Handle initialization and Pending Appointment Check
  useEffect(() => {
    isMounted.current = true;

    const initialize = async () => {
      setIsLoading(true);
      let dateToFetch = new Date();

      if (userId) {
        const pendingRes = await getPendingAppointmentForDoctor({
          doctorId,
          userId,
        });

        if (
          isMounted.current &&
          pendingRes.success &&
          pendingRes.data?.appointment
        ) {
          const appt = pendingRes.data.appointment;

          // Use parseISO or new Date(string) depending on your string format
          const pendingDate = new Date(appt.date);

          // Update states with pending data
          dateToFetch = pendingDate;
          setDate(pendingDate);

          setInitialTimeSlot({
            startTime: appt.startTime,
            endTime: appt.endTime,
            // Constructing ISO strings for valid Date objects
            startTimeUTC: new Date(`${appt.date}T${appt.startTime}:00Z`),
            endTimeUTC: new Date(`${appt.date}T${appt.endTime}:00Z`),
          });
        }
      }

      await fetchSlotsForDate(dateToFetch);
      isInitialLoad.current = false; // Initial sync complete
    };

    initialize();

    return () => {
      isMounted.current = false;
    };
  }, [doctorId, userId, fetchSlotsForDate]);

  // Trigger fetch when the date state is changed manually via UI
  useEffect(() => {
    // Only trigger if this isn't the first load (to avoid double fetching during init)
    if (isInitialLoad.current) return;

    if (date) {
      fetchSlotsForDate(date);
    }
  }, [date, fetchSlotsForDate]);

  return {
    date,
    setDate,
    timeSlots,
    initialTimeSlot,
    isLoading,
    fetchSlotsForDate,
  };
};
