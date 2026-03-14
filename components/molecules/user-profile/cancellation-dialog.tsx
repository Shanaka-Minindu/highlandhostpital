"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CancellationDialogProps {
  isInfoOpen: boolean;
  onInfoOpenChange: (isOpen: boolean) => void;
  isConfirmOpen: boolean;
  onIsConfirmOpenChange: (isOpen: boolean) => void;
  isPending: boolean;
  onConfirmCancelAppointment: () => void; // Changed to match your usage in the parent
}

const CancellationDialog = ({
  isConfirmOpen,
  isInfoOpen,
  isPending,
  onConfirmCancelAppointment,
  onInfoOpenChange,
  onIsConfirmOpenChange,
}: CancellationDialogProps) => {
  return (
    <>
      {/* 1. Information Dialog: When user is directed to call admin */}
      <Dialog open={isInfoOpen} onOpenChange={onInfoOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Cancel Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 leading-relaxed">
              Please contact Highland hospital. <br />
              call <span className="font-bold text-slate-900">0764435566</span> to cancel the appointment.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onInfoOpenChange(false)}
              className="px-8 border-slate-300"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Confirmation Dialog: When user can cancel directly */}
      <Dialog open={isConfirmOpen} onOpenChange={onIsConfirmOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Cancel Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 font-medium">
              Are you sure you want to cancel this appointment?
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onIsConfirmOpenChange(false)}
              disabled={isPending}
              className="text-slate-600 hover:bg-slate-100 px-8"
            >
              No
            </Button>
            <Button
              type="button"
              onClick={onConfirmCancelAppointment}
              disabled={isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancellationDialog;