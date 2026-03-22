"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

import BookingSteps from "@/components/molecules/booking-steps";
import { AppointmentDataWithBilling } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaypalCheckout from "./paypal-checkout";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { confirmCashAppointment } from "@/lib/actions/appointment.actions";
import toast from "react-hot-toast";

interface PaymentClientProps {
  appointmentData: AppointmentDataWithBilling;
  paypalClientId: string;
}

const PaymentClient = ({
  appointmentData,
  paypalClientId,
}: PaymentClientProps) => {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PAYPAL">(
    "PAYPAL",
  );

  const [isPending, setTransition] = useTransition();
  const [btnDisable, setDisable] = useState(false)

  const isDisable = isPending || btnDisable;
  const {
    appointmentId,
    doctorId,
    doctorName,
    doctorSpecialty,
    date,
    startTime,
    patientName,
    patientEmail,
    phoneNumber,
    patientDateOfBirth,
    reasonForVisit,
    additionalNotes,
    fee,
  } = appointmentData;

  // Format Date: "April 28, 2025 at 12:30"
  const formattedDate = React.useMemo(() => {
    try {
      return `${format(parseISO(date), "MMMM d, yyyy")} at ${startTime}`;
    } catch (e) {
      return `${date} at ${startTime}`;
    }
  }, [date, startTime]);

  const handelPaymentSuccess = () => {
    setTransition(() => {
      router.push(`/appointments/success?appointmentId=${appointmentId}`);
    });
  };

const payWithCash = () => {
    // 1. Guard against clicks if terms aren't agreed (though button is disabled)
    if (!agreed){
        toast.error("You should agree to the Terms and conditions.");
        return;
    }
setDisable(true)
    setTransition(async () => {
      try {
        // 2. Call the server action
        const response = await confirmCashAppointment({ appointmentId });

        if (response.success) {
          // 3. Show success message and redirect
          toast.success(response.message || "Appointment confirmed!");
          router.push(`/appointments/success?appointmentId=${appointmentId}`);
        } else {
          // 4. Handle specific conflict or error cases
          toast.error(response.message || "Failed to confirm appointment.");
          
          if (response.errorType === "CONFLICT" || response.errorType === "NOT_FOUND") {
            // If the slot is gone or already taken, send back to doctor profile
            router.push(`/doctors/${doctorId}`);
          }
        }
      } catch (error) {
        console.error("Cash payment error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }finally{
        setDisable(false)
      }
    });
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
        disableFunding: "card",
        dataNamespace:"paypal_sdk"
      }}
    >
      <div className="max-w-4xl mx-auto pb-20 px-4">
        {/* Header Navigation */}
        <div className="flex items-center justify-between py-6 border-b mb-4">
          <Link
            href={`/doctors/?doctorId=${doctorId}`}
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Doctor Profile
          </Link>
        </div>

        <BookingSteps currentStep={4} />

        <div className="space-y-6 mt-8">
          {/* Appointment Details Section */}
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Date & Time:</span>
                <p className="font-medium md:mt-1">{formattedDate}</p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Doctor:</span>
                <p className="font-medium md:mt-1">{doctorName}</p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Specialty:</span>
                <p className="font-medium md:mt-1">{doctorSpecialty}</p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Visit Type:</span>
                <p className="font-medium md:mt-1">
                  {reasonForVisit || "Regular Checkup"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information Section */}
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Name:</span>
                <p className="font-medium md:mt-1">{patientName}</p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Date of Birth:</span>
                <p className="font-medium md:mt-1">
                  {patientDateOfBirth
                    ? format(new Date(patientDateOfBirth), "MM/dd/yyyy")
                    : "N/A"}
                </p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Email:</span>
                <p className="font-medium md:mt-1">{patientEmail}</p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500">Phone:</span>
                <p className="font-medium md:mt-1">{phoneNumber}</p>
              </div>
            </CardContent>
          </Card>

          {additionalNotes && (
            <Card className="border-none shadow-sm bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
                <div className="flex justify-between md:block">
                  <span className="text-slate-500">Note:</span>
                  <p className="font-medium md:mt-1">{additionalNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details Section */}
          <Card className="border-none shadow-sm bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-medium">${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold text-base">Total Amount Due</span>
                <span className="font-bold text-base text-blue-600">
                  ${fee.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Select Payment Method */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Select Payment Method</h3>
            <RadioGroup
              defaultValue="PAYPAL"
              disabled={isDisable}
              onValueChange={(val) =>
                setPaymentMethod(val as "CASH" | "PAYPAL")
              }
              className="space-y-3"
            >
              <div
                className={`flex items-center space-x-3 border rounded-xl p-4 transition-all ${paymentMethod === "CASH" ? "border-blue-500 bg-blue-50/50" : "border-slate-200"}`}
              >
                <RadioGroupItem value="CASH" disabled={isDisable} id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center cursor-pointer font-semibold"
                >
                  <span className="mr-2 text-xl">💵</span> Pay Cash at Counter
                </Label>
              </div>
              <div
                className={`flex items-center space-x-3 border rounded-xl p-4 transition-all ${paymentMethod === "PAYPAL" ? "border-blue-500 bg-blue-50/50" : "border-slate-200"}`}
              >
                <RadioGroupItem value="PAYPAL" disabled={isDisable} id="paypal" />
                <Label
                  htmlFor="paypal"
                  className="flex items-center cursor-pointer font-semibold text-blue-800"
                >
                  <span className="mr-2 text-xl">🅿️</span> PayPal
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-100 mt-6">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-slate-600 leading-relaxed cursor-pointer"
            >
              I agree to the payment terms and cancellation policy. I understand
              that I can cancel or reschedule up to 24 hours before the
              appointment.
            </Label>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t">
            <Button
              variant="outline"
              disabled={isDisable}
              className="w-full md:w-auto px-8 font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
              onClick={() =>
                router.push(
                  `/appointments/patient-details?appointmentId=${appointmentId}`,
                )
              }
            >
              Edit Details
            </Button>

            <div className="text-center md:text-right w-full md:w-auto">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-black text-slate-900 mb-4">
                ${fee.toFixed(2)}
              </p>
            </div>
          </div>
          {paymentMethod === "CASH" && (
            <Button
              disabled={!agreed ||isDisable}
              onClick={payWithCash}
              className="w-full h-14 text-lg font-bold rounded-xl"
            >
              Pay with Cash
            </Button>
          )}
          {paymentMethod === "PAYPAL" && (
            <PaypalCheckout
              appointmentId={appointmentId}
              disabled={!agreed || isDisable}
              onSubmit={handelPaymentSuccess}
            />
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PaymentClient;
