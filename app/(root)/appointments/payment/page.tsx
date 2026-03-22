import React from "react";
import PaymentClient from "./payment-client";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAppTimeZone } from "@/lib/config";
import { AppointmentDataWithBilling } from "@/types";
import { getAppointmentData } from "@/lib/actions/appointment.actions";
import { prisma } from "@/db/prisma";
import { formatDate } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface PaymentPageParams {
  appointmentId: string;
}

const PaymentPage = async ({
  searchParams,
}: {
  searchParams: Promise<PaymentPageParams>;
}) => {
  const { appointmentId } = await searchParams;
  if (!appointmentId) {
    toast.error("Something missing.. please retry..");
    redirect("/");
  }
  const session = await auth();
  const TIME_ZONE = getAppTimeZone();
  const userId = session?.user.id;
  const appointmentResponse = await getAppointmentData({ appointmentId });

  if (!appointmentResponse.success || !appointmentResponse.data) {
    toast.error("Something missing.. please retry..");
    redirect("/");
  }

  const getPrimaryData = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      email: true,
      name: true,
    },
  });

  if (!getPrimaryData) {
    toast.error("Something missing.. please retry..");
    redirect("/");
  }

  const appointment = appointmentResponse.data;

  if (appointment.userId !== userId) {
    toast.error("Something going on background...");
    redirect("/");
  }

  const zonedStartTime = toZonedTime(
    appointment.appointmentStartUTC,
    TIME_ZONE,
  );
  const zonedEntTime = toZonedTime(appointment.appointmentEndUTC, TIME_ZONE);

  const dateStr = formatDate(zonedStartTime, "yyyy-MM-dd");
  const startTime = formatDate(zonedStartTime, "HH:mm");
  const endTime = formatDate(zonedEntTime, "HH:mm");

  const appointmentData: AppointmentDataWithBilling = {
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
    fee: 150,
    patientEmail: getPrimaryData.email,
  };

  const paypalClientId = process.env.PAYPAL_CLIENT_ID;

  if(!paypalClientId){
    return <div className="text-alert-2 text-center my-4">  Payment gateway not configured </div>
  }

  return (
    <div>
      <PaymentClient appointmentData={appointmentData} paypalClientId={paypalClientId}/>
    </div>
  );
};

export default PaymentPage;
