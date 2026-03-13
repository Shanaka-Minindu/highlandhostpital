"use client";
import EditPatientProfile from "@/components/molecules/user-profile/edit-patient-profile";
import PersonalInformation from "@/components/organisms/user-profile/personal-information";
import ProfileHeader from "@/components/organisms/user-profile/profileHeader";
import { Appointment, PatientProfile } from "@/types";
import React, { useEffect, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  

  useEffect(() => {
    if (appointmentError) {
    }
  }, [appointmentError]);

  return (
    <div>
      {" "}
      <EditPatientProfile
        dialogOpen={isOpen}
        dialogClose={() => setIsOpen(false)}
        patientData={patientData}
      />
      <ProfileHeader userData={patientData} />
      <PersonalInformation
        personalInfo={patientData}
        editBtn={() => setIsOpen(true)}
      />
    </div>
  );
};

export default PatientProfileClient;
