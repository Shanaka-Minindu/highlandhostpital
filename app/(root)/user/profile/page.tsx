// app/user/profile/page.tsx
import React from "react";
import {
  getUserDetails,
  getUserAppointments,
} from "@/lib/actions/user.actions";
import PatientProfileClient from "./patient-profile-client";
import { PAGE_SIZE } from "@/lib/constants";
import { notFound, redirect } from "next/navigation";

interface SearchParams {
  page?: string;
  appointmentId?: string;
}

const PatientProfilePage = async (props: {
  searchParams: Promise<SearchParams>;
}) => {
  // 1. Extract Search Params
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const appointmentId = searchParams.appointmentId || "";

  // 2. Fetch Patient Profile Data
  const detailsResponse = await getUserDetails();

  if (!detailsResponse.success) {
    if (detailsResponse.errorType === "UNAUTHORIZED") {
      return redirect("/sign-in"); // Adjusted to your sign-in path
    }
    if (detailsResponse.errorType === "NOT_FOUND") {
      return notFound();
    }
    // For any other error (SERVER_ERROR, etc.)
    return redirectToErrorPage(
      detailsResponse.errorType || "UNKNOWN_ERROR",
      detailsResponse.error || "An unexpected error occurred",
    );
  }

  // 3. Fetch Appointment Data
  const appointmentResponse = await getUserAppointments({
    page: currentPage,
    limit: PAGE_SIZE,
  });

  // We initialize empty defaults for the client,
  // but we'll pass the error if the appointment fetch fails.
  const appointmentData = appointmentResponse.data;

  

  return (
    <div className="container mx-auto py-10">
      <PatientProfileClient
        patientData={detailsResponse.data!}
        appointments={appointmentData?.appointment || []}
        appointmentId={appointmentId}
        currentPage={appointmentData?.currentPage || currentPage}
        totalPages={appointmentData?.totalPages || 1}
        appointmentError={
          !appointmentResponse.success ? appointmentResponse.error : undefined
        }
        
      />
    </div>
  );
};

// Helper inside the same file or a separate lib file
const redirectToErrorPage = (errorType: string, NormalErrorMessage: string) => {
  const errorMessage = encodeURIComponent(NormalErrorMessage);
  const params = new URLSearchParams({
    errorType,
    errorMessage,
  });
  redirect(`/?${params.toString()}`);
};

export default PatientProfilePage;
