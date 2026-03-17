"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAppointmentSlots } from "@/hooks/useAppointmentSlots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addMonths,
  isSunday,
  startOfMonth,
  isSameMonth,
  startOfDay,
  isAfter,
  isBefore,
  isSameDay,
  format, // Added for date comparison logic
} from "date-fns";
import { TimeSlot } from "@/types";
import { Loader2 } from "lucide-react";
import { useAppointmentReservation } from "@/hooks/useAppointmentReservation";

interface ScheduleAppointmentProps {
  doctorId: string;
  userId?: string;
  userRole?: string;
}

const ScheduleAppointment = ({
  doctorId,
  userId,
  userRole
}: ScheduleAppointmentProps) => {
  const {
    date,
    setDate,
    timeSlots,
    initialTimeSlot,
    isLoading,
    fetchSlotsForDate,
  } = useAppointmentSlots(doctorId, userId);

  const [userSelectedSlot, setUserSelectedSlot] = useState<TimeSlot | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [outOfRange, setOutOfRange] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setOutOfRange(true);
    if (initialTimeSlot) {
      setOutOfRange(true);
      setDate(initialTimeSlot.startTimeUTC);
    }
  }, []);

 const {isPending,mutate:reserveAppointment} =useAppointmentReservation({
    userId,
    onConflict: () => {
      setUserSelectedSlot(null);

      if (date) fetchSlotsForDate(date);
    },
  });

  /**
   * LOGIC FOR AUTOMATIC SELECTION:
   * 1. Check if the currently selected calendar 'date' is the same as the 'initialTimeSlot' date.
   * 2. The activeSlot is either what the user just clicked (userSelectedSlot)
   * OR the initialTimeSlot (if we are on the correct day and user hasn't overridden it).
   */
  const isInitialDateActive =
    initialTimeSlot &&
    date &&
    isSameDay(date, new Date(initialTimeSlot.startTimeUTC));

  const activeSlot =
    userSelectedSlot || (isInitialDateActive ? initialTimeSlot : null);

  const minDate = startOfDay(new Date());
  const maxDate = addMonths(new Date(), 2);

  const handleMonthChange = (newMonth: Date) => {
    const today = new Date();
    setUserSelectedSlot(null); // Reset manual selection on month change

    if (isSameMonth(newMonth, today)) {
      setDate(initialTimeSlot ? new Date(initialTimeSlot.startTimeUTC) : today);
    } else {
      if (isBefore(startOfMonth(newMonth), today)) {
        setOutOfRange(false);
        setDate(undefined);
      } else if (isAfter(startOfMonth(newMonth), maxDate)) {
        setOutOfRange(false);
        setDate(undefined);
      } else {
        setOutOfRange(true);
        setDate(startOfMonth(newMonth));
      }
    }
  };

 const continueAction = () => {
    // 1. Guard clause: ensure a slot is actually selected
    if (!activeSlot) {
      alert("Please select a time slot first.");
      return;
    }

    // 2. Extract and format the data for the reservation payload
    // We use activeSlot.startTimeUTC to get the correct date reference
    const payload = {
      doctorId,
      date: format(activeSlot.startTimeUTC, "yyyy-MM-dd"),
      startTime: activeSlot.startTime, // Already "HH:mm" from the TimeSlot type
      endTime: activeSlot.endTime,     // Already "HH:mm" from the TimeSlot type
    };

    // 3. Call the mutate function from useAppointmentReservation
    reserveAppointment(payload);
  };

  if (!isMounted) {
    return (
      <div className="w-full min-h-[500px] rounded-xl border border-dashed border-slate-200 animate-pulse bg-slate-50" />
    );
  }

  return (
    <Card className="max-w-md mx-auto p-6 rounded-lg border-0 bg-background shadow-small">
      <CardHeader>
        <CardTitle>
          <h3 className="text-text-title">Schedule Appointment</h3>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex justify-center border-1 border-border rounded-lg">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d);
                setOutOfRange(true);
                // When date changes, clear the manual selection.
                // If 'd' is the initial date, activeSlot will automatically
                // re-evaluate to initialTimeSlot.
                setUserSelectedSlot(null);
              }
            }}
            onMonthChange={handleMonthChange}
            disabled={(day) => day < minDate || day > maxDate || isSunday(day)}
            initialFocus
            classNames={{ day: "focus-visible:ring-0" }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="body-semibold text-text-title">
            Available Time Slots
          </div>

          {isLoading ? (
            <div className="gap-3 flex justify-center opacity-50 p-32">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : outOfRange && timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot, index) => {
                // Compare the current slot in the map to our calculated activeSlot
                const isSelected = activeSlot?.startTime === slot.startTime;

                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    className={`py-6 body-small-bold text-text-body ${
                      isSelected
                        ? "hover:bg-blue-600 text-white"
                        : "text-text-title"
                    }`}
                    onClick={() => setUserSelectedSlot(slot)}
                  >
                    {slot.startTime}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-text-body-subtle text-center py-4">
              No slots available for this date.
            </p>
          )}
        </div>

        <Button
  className="w-full py-6 text-lg hover:bg-blue-600 mt-4"
  onClick={continueAction}
  // Disable button if loading slots, processing reservation, or no slot selected
  disabled={!activeSlot || isLoading || isPending || userRole ==="ADMIN"}
>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Reserving...
    </>
  ) : (
    "Continue to Next Step"
  )}
</Button>
      </CardContent>
    </Card>
  );
};

export default ScheduleAppointment;
