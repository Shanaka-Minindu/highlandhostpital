"use client";

import React, { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { PatientProfile, PatientProfileUpdateInput } from "@/types";
import { patientProfileUpdate } from "@/lib/actions/user.actions";
import { patientProfileUpdateSchema } from "@/lib/validators";



interface EditPatientProfileProps {
  dialogOpen: boolean;
  dialogClose: () => void;
  patientData: PatientProfile;
}

const EditPatientProfile = ({
  dialogClose,
  dialogOpen,
  patientData,
}: EditPatientProfileProps) => {
  const [isPending, startTransition] = useTransition();

  // 1. Setup React Hook Form
  const form = useForm<PatientProfileUpdateInput>({
    resolver: zodResolver(patientProfileUpdateSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
      dateofbirth: "",
    },
  });

  // 2. Sync incoming patientData to form fields when the dialog opens
  // Mapping dateOfBirth (type) -> dateofbirth (schema/form)
  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        name: patientData.name || "",
        phoneNumber: patientData.phoneNumber || "",
        address: patientData.address || "",
        dateofbirth: patientData.dateOfBirth || "",
      });
    }
  }, [dialogOpen, patientData, form]);

  // 3. Submit Handler using startTransition for better UX
  const onSubmit = (values: PatientProfileUpdateInput) => {
    const submittingToast = toast.loading("Updating Profile Info....")
    startTransition(async () => {
      try {
        const result = await patientProfileUpdate(values);

        if (result.success) {
          toast.success(result.message || "Profile updated successfully",{id:submittingToast});
          dialogClose();
        } else {
          // Handle server-side validation errors if provided
          if (result.fieldErrors) {
            Object.keys(result.fieldErrors).forEach((key) => {
              form.setError(key as keyof PatientProfileUpdateInput, {
                type: "server",
                message: result.fieldErrors![key]?.[0],
              });
            });
          }
          toast.error(result.message || "Failed to update profile",{id:submittingToast});
        }
      } catch (error) {
        toast.error("An unexpected error occurred",{id:submittingToast});
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-4"
          >
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="07xxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your address"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateofbirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Date of Birth
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-2 sm:justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={dialogClose}
                disabled={isPending }
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="bg-blue-500 hover:bg-blue-600 px-8"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientProfile;
