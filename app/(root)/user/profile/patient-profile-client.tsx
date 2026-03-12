"use client"
import ProfileHeader from "@/components/organisms/user-profile/profileHeader";
import { Appointment, PatientProfile } from "@/types";
import React, { useEffect } from "react";

interface PatientProfileClientProps {
  patientData: PatientProfile;
  appointment: Appointment[];
  appointmentId?: string;
  totalPages: number;
  currentPage: number;
  appointmentError?: string;
}

const PatientProfileClient = ({
  appointment,
  appointmentId,
  currentPage,
  patientData,
  totalPages,
  appointmentError,
}: PatientProfileClientProps) => {
    useEffect(()=>{
        if(appointmentError){

        }
    },[appointmentError])
  return <div> <ProfileHeader userData={patientData}/></div>;
};

export default PatientProfileClient;
