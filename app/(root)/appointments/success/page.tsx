import { getSuccessAppointmentData } from "@/lib/actions/appointment.actions";
import React from "react";
import SuccessClient from "./success-client";

interface SuccessPageProps {
  appointmentId: string;
}

const SuccessPage = async({
  searchParams,
}: {
  searchParams: Promise<SuccessPageProps>;
}) => {
  const {appointmentId} = await searchParams;
  const appointmentData =await getSuccessAppointmentData(appointmentId);
  if(!appointmentData.data){
    return
  }
  return <SuccessClient appointmentData={appointmentData.data}/>;
};

export default SuccessPage;
