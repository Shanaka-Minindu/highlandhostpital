"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDate, isValid, parse } from "date-fns";
import { Phone, Calendar as CalendarIcon, Pencil } from "lucide-react";
import { MdEdit, MdPhone } from "react-icons/md";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  AppointmentDetails,
  AppointmentSubmissionData,
  PatientDetails,
  PatientDetailsFormValues,
} from "@/types";
import { patientDetailsSchema } from "@/lib/validators";
import toast from "react-hot-toast";
import { processAppointmentBooking } from "@/lib/actions/appointment.actions";
import { useRouter } from "next/navigation";

interface PatientDetailsFormProps {
  patientDetailsForClient: PatientDetails;
  appointmentDetailsForClient: AppointmentDetails;
}

const PatientDetailsForm = ({
  appointmentDetailsForClient,
  patientDetailsForClient,
}: PatientDetailsFormProps) => {
  const patientTypeData = appointmentDetailsForClient.patientType || "MYSELF";
  const initialStateOfAlternativePhone =
    !!appointmentDetailsForClient.phoneNumber &&
    patientDetailsForClient.phoneNumber !==
      appointmentDetailsForClient.phoneNumber;

  const router = useRouter();

  const form = useForm<PatientDetailsFormValues>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues: {
      patientType: patientTypeData,
      fullName:
        appointmentDetailsForClient.patientType === "MYSELF"
          ? patientDetailsForClient.name
          : appointmentDetailsForClient.patientName &&
              appointmentDetailsForClient.patientName !==
                patientDetailsForClient.name
            ? appointmentDetailsForClient.patientName
            : "",

      email: patientDetailsForClient.email,
      phone: "", // This is for the alternate phone input
      useAlternatePhone: initialStateOfAlternativePhone,

      reason: appointmentDetailsForClient?.reasonForVisit?appointmentDetailsForClient?.reasonForVisit:"",
      notes: appointmentDetailsForClient.additionalNotes? appointmentDetailsForClient.additionalNotes : "",
    },
  });

  const patientType = form.watch("patientType");
  const useAlternatePhone = form.watch("useAlternatePhone");

  const onSubmit = async (data: PatientDetailsFormValues) => {
    if (!patientDetailsForClient.phoneNumber && !data.useAlternatePhone) {
      toast.error("You should add phone number to precede the appointment");
      form.setValue("useAlternatePhone", true, { shouldValidate: true });
      setTimeout(() => {
        form.setFocus("phone");
      }, 0);

      return;
    }

    const bookingToastId = toast.loading("Booking Processing.....");
    

    try {
      const submissionData: AppointmentSubmissionData = {
        ...data,
        appointmentId: appointmentDetailsForClient.appointmentId,
        date: appointmentDetailsForClient.date,
        doctorId: appointmentDetailsForClient.doctorId,
        startTime: appointmentDetailsForClient.startTime,
        endTime: appointmentDetailsForClient.endTime,
        isSelf: appointmentDetailsForClient.patientType === "MYSELF",
        phone: data.phone ?data.phone: patientDetailsForClient.phoneNumber,
        patientDateOfBirth:
          appointmentDetailsForClient.patientType === "SOMEONE_ELSE" &&
          data.dateOfBirth &&
          isValid(parse(data.dateOfBirth, "dd/MM/yyy", new Date()))
            ? format(
                parse(data.dateOfBirth, "dd/MM/yyyy", new Date()),
                "yyyy-MM-dd",
              )
            : formatDate(patientDetailsForClient.dateOfBirth,"dd/MM/yyyy") ,
      };

      const result = await processAppointmentBooking(submissionData);

      if (result.success) {
        toast.success("Appointment successfully added", { id: bookingToastId });
        router.push(
          `/appointments/payment?appointmentId=${result.data?.appointmentId}`,
        );
      } else {
        toast.error(result.message || "Something went wrong..", {
          id: bookingToastId,
        });
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something want wrong..";
      toast.error(errorMsg, { id: bookingToastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Toggle Selection */}
        <div className="space-y-4">
          <FormLabel className="text-base font-bold">
            Who is this appointment for?
          </FormLabel>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={patientType === "MYSELF" ? "default" : "outline"}
              className={cn(
                "flex-1 py-8 text-lg font-semibold border-2",
                patientType === "MYSELF"
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white border-slate-200",
              )}
              onClick={() => {
                form.setValue("patientType", "MYSELF");
                form.setValue("fullName", patientDetailsForClient.name);
              }}
            >
              Myself
            </Button>
            <Button
              type="button"
              variant={patientType === "SOMEONE_ELSE" ? "default" : "outline"}
              className={cn(
                "flex-1 py-8 text-lg font-semibold border-2",
                patientType === "SOMEONE_ELSE"
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white border-slate-200",
              )}
              onClick={() => {
                form.setValue("patientType", "SOMEONE_ELSE");
                form.setValue("fullName", "");
              }}
            >
              Someone Else
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Relationship - Only for Someone Else */}
          {patientType === "SOMEONE_ELSE" && (
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Relationship to Patient
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="py-6 w-full">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  Full Name of Patient
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter full name"
                      className="py-6 pr-10"
                      {...field}
                      disabled={patientType === "MYSELF"}
                    />
                    {patientType === "MYSELF" && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-primary absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => {
                          router.push(
                            `/user/profile?appointmentId=${appointmentDetailsForClient.appointmentId}`,
                          );
                        }}
                      >
                        <MdEdit size={16} />
                      </Button>
                    )}
                  </div>
                </FormControl>
                {patientType === "MYSELF" && (
                  <FormDescription>
                    To update your name please visit your profile.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth - Only for Someone Else with Calendar Picker */}
          {patientType === "SOMEONE_ELSE" && (
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold mb-1">
                    Date of Birth of Patient
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full py-6 pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? field.value : <span>DD/MM/YYYY</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={
                          field.value
                            ? parse(field.value, "dd/MM/yyyy", new Date())
                            : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "dd/MM/yyyy") : "")
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Please pick the date in DD/MM/YYYY format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Email - Always Disabled */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Email Address</FormLabel>
                <FormControl>
                  <Input
                    className="py-6 bg-slate-50 border-slate-200"
                    {...field}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number Logic */}
          <div className="space-y-4">
            <FormItem>
              <FormLabel className="font-bold">Primary Phone Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    className="py-6 pr-10 bg-slate-50"
                    value={patientDetailsForClient.phoneNumber}
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-primary absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      router.push(
                        `/user/profile?appointmentId=${appointmentDetailsForClient.appointmentId}`,
                      );
                    }}
                  >
                    <MdPhone />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                This is your profile phone number. To update it, please visit
                settings.
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="useAlternatePhone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md  py-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Use a different phone number for this appointment
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Render NEW input field when checkbox is checked */}
            {useAlternatePhone && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <FormLabel className="font-bold text-blue-600">
                      New Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g. 0712345678"
                          className="py-6 pr-10 border-blue-200 focus:border-blue-500"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-primary absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => {
                            router.push(
                              `/user/profile?appointmentId=${appointmentDetailsForClient.appointmentId}`,
                            );
                          }}
                        >
                          <MdPhone />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Reason for Visit */}
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Reason for Visit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="py-6 w-full">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Checkup">General Checkup</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                  
                    placeholder="Add any additional information about your visit"
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            className="px-8 py-6 font-bold text-slate-600"
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-10 py-6 font-bold bg-blue-500 hover:bg-blue-600 text-white"
          >
            Continue to Book
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientDetailsForm;
