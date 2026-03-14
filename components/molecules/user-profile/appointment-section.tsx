import { Appointment } from "@/types";
import React from "react";
import AppointmentCard from "./appointment-card";
import PaginationControls from "../pagination-controls";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AppointmentSectionProps {
  appointments: Appointment[];
  currentPage: number;
  totalPages: number;
  pageChange: (page: number) => void;
  selectedAppointment: (appointment: Appointment | null) => void;
  onInfoOpenChange: (isOpen: boolean) => void;
  onConfirmOpenChange: (isOpen: boolean) => void;
  selectedAppointmentForReview:(appointment: Appointment | null) => void;
  reviewDialogOpen: (isOpen: boolean) => void;
}

const AppointmentSection = ({
  appointments,
  currentPage,
  pageChange,
  totalPages,
  onInfoOpenChange,
  selectedAppointment,
  onConfirmOpenChange,
  reviewDialogOpen,
  selectedAppointmentForReview
}: AppointmentSectionProps) => {
  return (
    <div className="my-8">
      <h3 className="mb-4">Appointments</h3>
      {appointments.length === 0 ? (
        <>
          <div>No appointments Available</div>
          <Button asChild variant="brand" className="text-text-caption-2">
            {" "}
            <Link href="/#our-doctors">Book an Appointment</Link>
          </Button>
        </>
      ) : (
        <div>
          {appointments.map((appointment) => {
            return (
              <AppointmentCard
                appointment={appointment}
                key={appointment.id}
                selectedAppointment={selectedAppointment}
                onInfoOpenChange={onInfoOpenChange}
                onConfirmOpenChange={onConfirmOpenChange}
                reviewDialogOpen={reviewDialogOpen}
                selectedAppointmentForReview={selectedAppointmentForReview}
              />
            );
          })}
        </div>
      )}
      <div className="flex justify-center pt-6">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={pageChange}
        />
      </div>
    </div>
  );
};

export default AppointmentSection;
