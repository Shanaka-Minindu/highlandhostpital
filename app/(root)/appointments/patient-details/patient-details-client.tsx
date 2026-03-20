"use client";

import React from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import BookingSteps from "@/components/molecules/booking-steps";
import { AppointmentDetails, PatientDetails } from "@/types";
import { Button } from "@/components/ui/button";
import PatientDetailsForm from "./patient-details-form";

interface PatientDetailsClientProps {
  appointmentDetailsForClient: AppointmentDetails;
  patientDetailsForClient: PatientDetails;
}

const PatientDetailsClient = ({
  appointmentDetailsForClient,
  patientDetailsForClient,
}: PatientDetailsClientProps) => {
  const {
    doctorName,
    doctorSpecialty,
    doctorImage,
    date,
    startTime,
    doctorId,
  } = appointmentDetailsForClient;

  // Formatting: January 23, 2023 at 5.30PM
  const formattedDateTime = React.useMemo(() => {
    try {
      const dateObj = parseISO(date);
      const datePart = format(dateObj, "MMMM d, yyyy");
      // Assuming startTime is in a format like "17:30" or "05:30 PM"
      return `${datePart} at ${startTime}`;
    } catch (error) {
      return `${date} at ${startTime}`;
    }
  }, [date, startTime]);

  const doctorInitial = doctorName.trim().charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-190 mx-auto bg-background-0">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-slate-100">
        <Link
          href={`/doctors/${doctorId}`}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1 body-regular" />
          Back to Doctor Profile
        </Link>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-text-body-subtle font-bold">
            Selected Appointment
          </p>
          <p className="text-md font-bold text-text-title">{formattedDateTime}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Doctor Info Card */}
        <div className="flex items-center gap-4 mb-2">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
            {doctorImage ? (
              <Image
                src={doctorImage}
                alt={doctorName}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {doctorInitial}
              </span>
            )}
          </div>
          <div>
            <h3 className="">{doctorName}</h3>
            <p className="text-slate-500 text-sm">{doctorSpecialty}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <BookingSteps currentStep={3} />
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto space-y-10">
          <PatientDetailsForm appointmentDetailsForClient={appointmentDetailsForClient} patientDetailsForClient={patientDetailsForClient}/>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsClient;