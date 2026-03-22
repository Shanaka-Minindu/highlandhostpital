import React from "react";
import { redirect } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";

import PatientDetailsClient from "./patient-details-client";
import { AppointmentDetails, PatientDetails } from "@/types";
import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import { getAppTimeZone } from "@/lib/config";
import {
  getAppointmentData,
  updateGuestWithUser,
} from "@/lib/actions/appointment.actions";

interface patientDetailsSearchParams {
  guestIdentifier: string;
  appointmentId: string;
}

const PatientDetailsPage = async ({
  searchParams,
}: {
  searchParams: Promise<patientDetailsSearchParams>;
}) => {
  const { appointmentId, guestIdentifier } = await searchParams;
  const session = await auth();
  const timeZone = getAppTimeZone();

  if (!appointmentId) {
    redirect("/");
  }

  // 1. Fetch Appointment Data
  const appointmentRes = await getAppointmentData({ appointmentId });

  if (!appointmentRes.success || !appointmentRes.data) {
    console.error("Appointment Fetch Error:", appointmentRes.error);
    redirect("/"); // Redirect on error as requested
  }

  const appointment = appointmentRes.data;

  // 2. Authorization & Guest Linking Logic
  const isAuth = !!session?.user?.id;

  /**
   * SECURITY CHECK:
   * We allow access if:
   * A) User is logged in and their ID matches the appointment's userId
   * B) The appointment is a guest appointment and the guestIdentifier matches the URL
   */
  const isOwner = isAuth && appointment.userId === session.user.id;
  const isGuestMatch =
    guestIdentifier && appointment.guestIdentifier === guestIdentifier;

  if (!isOwner && !isGuestMatch) {
    redirect("/login");
  }

  // 3. Guest to User Conversion
  // If user is logged in, but the appointment is still tagged as a guest, link it.
  if (isAuth && !appointment.userId && isGuestMatch) {
    const linkRes = await updateGuestWithUser({ guestIdentifier });
    if (!linkRes.success) {
      console.warn(
        "Could not link guest appointment to user:",
        linkRes.message,
      );
    }
  }

  // 4. Fetch Patient Info (from User table if logged in)
  let userDetails = null;
  if (isAuth) {
    userDetails = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        dateofbirth: true,
      },
    });
  }

  // 5. Prepare Data Objects for Client
  // Convert UTC Database times to Application Timezone
  const startTime = formatInTimeZone(
    appointment.appointmentStartUTC,
    timeZone,
    "hh:mm a",
  );
  const endTime = formatInTimeZone(
    appointment.appointmentEndUTC,
    timeZone,
    "hh:mm a",
  );
  const dateStr = formatInTimeZone(
    appointment.appointmentStartUTC,
    timeZone,
    "yyyy-MM-dd",
  );

  const appointmentDetailsForClient: AppointmentDetails = {
    appointmentId: appointment.appointmentId, 
    doctorId: appointment.doctorId,
    doctorName: appointment.doctor.name,
    doctorSpecialty:
      appointment.doctor.doctorProfile?.specialty || "General Physician",
    doctorImage: appointment.doctor.image,
    date: dateStr,
    startTime: startTime,
    endTime: endTime,
    patientType: appointment.patientType as "MYSELF" | "SOMEONE_ELSE",
    patientName: appointment.patientName,
    patientDateOfBirth: appointment.patientdateofbirth,
    phoneNumber: appointment.phoneNumber,
    reasonForVisit: appointment.reasonForVisit,
    additionalNotes: appointment.additionalNotes,
    relationShip: appointment.patientRelation,
  };

  const patientDetailsForClient: PatientDetails = {
    name: userDetails?.name || "",
    email: userDetails?.email || "",
    phoneNumber: userDetails?.phoneNumber || "",
    dateOfBirth: userDetails?.dateofbirth
      ? formatInTimeZone(userDetails.dateofbirth, timeZone, "yyyy-MM-dd")
      : "",
  };

  return (
    <PatientDetailsClient
      appointmentDetailsForClient={appointmentDetailsForClient}
      patientDetailsForClient={patientDetailsForClient}
    />
  );
};

export default PatientDetailsPage;
