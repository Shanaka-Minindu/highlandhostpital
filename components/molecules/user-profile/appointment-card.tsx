"use client";

import React from "react";
import { Star, XCircle, Eye } from "lucide-react";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tr } from "date-fns/locale";

function getStatusBadgeColors(status: Appointment["status"]) {
  switch (status) {
    case "upcoming":
      return "bg-amber-100 text-amber-800"; // Lightened for better badge readability
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "no show":
      return "bg-yellow-100 text-yellow-800";
    case "cash payment":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

interface AppointmentCardProps {
  appointment: Appointment;
  selectedAppointment: (appointment: Appointment | null) => void;
  onInfoOpenChange: (isOpen: boolean) => void;
  onConfirmOpenChange: (isOpen: boolean) => void;
  reviewDialogOpen:(isOpen: boolean) => void;
  selectedAppointmentForReview:(appointment: Appointment | null) => void;
}

const AppointmentCard = ({
  appointment,
  onConfirmOpenChange,
  onInfoOpenChange,
  selectedAppointment,
  reviewDialogOpen,
  selectedAppointmentForReview
}: AppointmentCardProps) => {
  const { id, doctorName, date, time, status, isReviewed } = appointment;

  const handleAction = () => {
   
    if (status === "upcoming") {
      onInfoOpenChange(true);
    }
    if (status === "cash payment") {
      onConfirmOpenChange(true);
      selectedAppointment(appointment);
    }
  };

  const reviewAction =(data:string)=>{
    if(data ==="leave_review"){
      reviewDialogOpen(true);
      selectedAppointmentForReview(appointment);
    }
  }

  return (
    <div
      key={id}
      className="w-full bg-white border my-2 border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Doctor Info & Time */}
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-slate-900">{doctorName}</h3>
          <p className="text-sm text-slate-500 font-medium">
            {date} <span className="mx-1">•</span> {time}
          </p>
        </div>

        {/* Right Side: Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap",
              getStatusBadgeColors(status),
            )}
          >
            {status}
          </span>

          {/* Conditional Buttons based on status */}
          <div className="flex items-center gap-2">
            {/* 1. Upcoming or Cash Payment -> Cancel Button */}
            {(status === "upcoming" || status === "cash payment") && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                onClick={handleAction}
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            )}

            {/* 2. Completed -> Review Logic */}
            {status === "completed" && (
              <>
                {!isReviewed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 gap-2 font-semibold"
                    onClick={()=>reviewAction("leave_review")}
                  >
                    <Star className="h-4 w-4" />
                    Leave Review
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600 border-slate-300 hover:bg-slate-50 gap-2"
                    onClick={()=>reviewAction("view_review")}
                  >
                    <Eye className="h-4 w-4" />
                    View Review
                  </Button>
                )}
              </>
            )}

            {/* Note: Cancelled and No Show only show the status badge per requirements */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
