"use client";

import React from "react";
import { Check, Info,  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentSuccessData } from "@/types";
import Link from "next/link";

interface SuccessClientProps {
  appointmentData: AppointmentSuccessData;
}

const SuccessClient = ({ appointmentData }: SuccessClientProps) => {
  const {
    appointmentId,
    doctorName,
    specialty,
    reasonForVisit,
    paymentId,
    amountPaid,
    paymentMethod,
    date,
    startTime,
    patientName,
    email,
    phone,
  } = appointmentData;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 transition-transform hover:scale-105">
          <Check className="w-10 h-10 text-green-600 stroke-[3px]" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-slate-500 font-medium">Your appointment has been confirmed</p>
      </div>

      <div className="space-y-6">
        {/* Booking Details Card */}
        <Card className="border-none shadow-sm bg-blue-50/40">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Booking Details</h3>
              <span className="text-xs font-mono font-bold text-slate-400">#{appointmentId}</span>
            </div>
            <div className="space-y-3 text-sm">
              <DetailRow label="Payment ID" value={paymentId} />
              <DetailRow label="Amount Paid" value={`$${amountPaid}`} />
              <DetailRow label="Payment Method" value={paymentMethod} />
            </div>
          </CardContent>
        </Card>

        {/* Appointment Information Card */}
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Appointment Information</h3>
            <div className="space-y-3 text-sm">
              <DetailRow label="Date & Time" value={`${date} at ${startTime}`} />
              <DetailRow label="Doctor" value={doctorName} />
              <DetailRow label="Specialty" value={specialty} />
              <DetailRow label="Visit Type" value={reasonForVisit} />
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Card */}
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Patient Details</h3>
            <div className="space-y-3 text-sm">
              <DetailRow label="Name" value={patientName} />
              <DetailRow label="Email" value={email} />
              <DetailRow label="Phone" value={phone} />
            </div>
          </CardContent>
        </Card>

        {/* Appointment Instructions Info Box */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-5 flex gap-4">
          <div className="mt-1">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm mb-2">Appointment Instructions</h4>
            <ul className="text-sm text-amber-600 font-medium space-y-1">
              <li>• Please arrive 15 minutes before your scheduled time</li>
              <li>• Bring any relevant medical records or test reports</li>
              <li>• Wear a mask during your visit</li>
            </ul>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            asChild
            variant="outline"
            className="flex-1 py-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
          >
            <Link href="/appointments">View Appointments</Link>
          </Button>
          <Button
            asChild
            className="flex-1 py-6 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
          >
            <Link href="/">Go To Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable row component for the data summaries
 */
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className="text-slate-900 font-semibold">{value}</span>
  </div>
);

export default SuccessClient;