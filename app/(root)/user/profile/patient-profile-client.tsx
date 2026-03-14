"use client";

import AppointmentSection from "@/components/molecules/user-profile/appointment-section";
import CancellationDialog from "@/components/molecules/user-profile/cancellation-dialog";
import EditPatientProfile from "@/components/molecules/user-profile/edit-patient-profile";
import ReviewDialog from "@/components/molecules/user-profile/review-dialog";
import PersonalInformation from "@/components/organisms/user-profile/personal-information";
import ProfileHeader from "@/components/organisms/user-profile/profileHeader";
import { CancelAppointment } from "@/lib/actions/shared.actions";
import { createNewTestimonial } from "@/lib/actions/testimonials.action";
import { reviewSchema } from "@/lib/validators";
import { Appointment, PatientProfile } from "@/types";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import React, { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import z from "zod";

interface PatientProfileClientProps {
  patientData: PatientProfile;
  appointments: Appointment[];
  appointmentId?: string;
  totalPages: number;
  currentPage: number;
  appointmentError?: string;
}

const PatientProfileClient = ({
  appointments,
  appointmentId,
  currentPage,
  patientData,
  totalPages,
  appointmentError,
}: PatientProfileClientProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [getReviewOpen, setReviewOpen] = useState(false);

  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const [reviewAppointment, setReviewAppointment] =
    useState<Appointment | null>(null);

  const [reviewIsPending, startReviewTransaction] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (appointmentError) {
    }
  }, [appointmentError]);

  function pageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", page.toString());

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const deleteAppointment = () => {
    startTransition(async () => {
      if (!appointment) return;
      const appointmentId = appointment.id;

      const results = await CancelAppointment(appointmentId);

      if (results.success) {
        toast.success(results.message || "Appointment cancelled successfully.");
      } else {
        toast.error(results.message || "Failed to cancel appointment.");
      }
      setConfirmOpen(false);
      setAppointment(null);
    });
  };

  const makeReview = (review: z.infer<typeof reviewSchema>) => {
    startReviewTransaction(async () => {
      if (!review) return;
      const results = await createNewTestimonial(review);
      if (results.success) {
        toast.success(results.message || "Review posted successfully.");
      } else {
        toast.error(results.message || "Failed post review.");
      }

      setReviewOpen(false);
    });
  };

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
      <AppointmentSection
        appointments={appointments}
        currentPage={currentPage}
        pageChange={pageChange}
        totalPages={totalPages}
        selectedAppointment={setAppointment}
        onConfirmOpenChange={setConfirmOpen}
        onInfoOpenChange={setInfoOpen}
        selectedAppointmentForReview={setReviewAppointment}
        reviewDialogOpen = {setReviewOpen} 

      />
      <CancellationDialog
        isInfoOpen={infoOpen}
        onInfoOpenChange={setInfoOpen}
        isConfirmOpen={confirmOpen}
        onIsConfirmOpenChange={setConfirmOpen}
        isPending={isPending}
        onConfirmCancelAppointment={deleteAppointment}
      />
      <ReviewDialog
        isReviewOpen={getReviewOpen}
        setReviewOpen={setReviewOpen}
        selectedAppointment={reviewAppointment}
        confirmReview={makeReview}
        isPending={reviewIsPending}
      />
    </div>
  );
};

export default PatientProfileClient;
