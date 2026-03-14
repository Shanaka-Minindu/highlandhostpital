"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useSession } from "next-auth/react";
import { Star, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { reviewSchema } from "@/lib/validators";
import { Appointment } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
  isReviewOpen: boolean;
  setReviewOpen: (isOpen: boolean) => void;
  selectedAppointment: Appointment | null;
  confirmReview: (review: z.infer<typeof reviewSchema>) => void;
  isPending: boolean;
}

type ReviewFormValues = z.infer<typeof reviewSchema>;

const ReviewDialog = ({
  confirmReview,
  isReviewOpen,
  isPending,
  selectedAppointment,
  setReviewOpen,
}: ReviewDialogProps) => {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
  });

  // Watch the rating value to update the star UI
  const currentRating = watch("rating", 0);

  useEffect(() => {
    if (isReviewOpen && selectedAppointment && session?.user?.id) {
      reset({
        appointmentId: selectedAppointment.id,
        doctorId: selectedAppointment.doctorId,
        patientId: session.user.id,
        rating: 0,
        testimonialText: "",
      });
    }
  }, [isReviewOpen, selectedAppointment, session, reset]);

  const onSubmit = (values: ReviewFormValues) => {
    confirmReview(values);
  };

  return (
    <Dialog open={isReviewOpen} onOpenChange={setReviewOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Review Appointment with {selectedAppointment?.doctorName}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            {selectedAppointment?.date} • {selectedAppointment?.time}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star, { shouldValidate: true })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8",
                      star <= currentRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm font-medium text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Testimonial Section */}
          <div className="space-y-3">
            <Label htmlFor="testimonialText" className="text-base font-semibold">
              Your Review
            </Label>
            <Textarea
              id="testimonialText"
              placeholder="Share your experience..."
              className={cn(
                "min-h-[120px] resize-none",
                errors.testimonialText && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register("testimonialText")}
            />
            {errors.testimonialText && (
              <p className="text-sm font-medium text-red-500">
                {errors.testimonialText.message}
              </p>
            )}
          </div>

          {/* Hidden Inputs for IDs */}
          <input type="hidden" {...register("doctorId")} />
          <input type="hidden" {...register("appointmentId")} />
          <input type="hidden" {...register("patientId")} />

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewOpen(false)}
              disabled={isPending}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-500 hover:bg-blue-600 px-8"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;