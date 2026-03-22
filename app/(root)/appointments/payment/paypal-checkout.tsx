import React, { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  approvePaypalOrder,
  createPaypalOrder,
} from "@/lib/actions/appointment.actions";
import toast from "react-hot-toast";
import { resolve } from "path";
interface PaypalCheckoutProps {
  appointmentId: string;
  disabled: boolean;
  onSubmit: () => void;
}

const PaypalCheckout = ({
  appointmentId,
  disabled,
  onSubmit,
}: PaypalCheckoutProps) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isApprovingOrder, setIsApprovingOrder] = useState(false);

  if (isPending) {
    return (
      <div className="text-center h-12 flex items-center justify-center my-4 text-muted-foreground">
        Loading Paypal.....
      </div>
    );
  }
  if (isRejected) {
    return (
      <div className="text-center text-alert-2 my-4">
        Error loading Paypal Checkout
      </div>
    );
  }

  async function createOrder(): Promise<string> {
    setIsCreatingOrder(true);
    const toastID = toast.loading("Initiating paypal......");
    try {
      const result = await createPaypalOrder(appointmentId);

      if (result.success && result.data?.orderId) {
        toast.success("Successfully Initialized Paypal", { id: toastID });
        return result.data.orderId;
      }
      toast.error("Paypal initializing failed", { id: toastID });

      await new Promise((resolve) => setTimeout(resolve, 100));
      throw new Error("ORDER_CREATING_FAILED");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };

      // Ensure the promise always rejects on error so the return type is never undefined.
      toast.error(error.message || "Something went wrong", { id: toastID });
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw err;
    } finally {
      setIsCreatingOrder(false);
    }
  }

  async function onApprove(data: { orderID: string }) {
    setIsApprovingOrder(true);
    const toastID = toast.loading("Approving paypal order......");

    try {
      // 1. Call our server action to capture the payment and update the DB
      const result = await approvePaypalOrder({
        appointmentId,
        data: { orderId: data.orderID },
      });

      if (result.success) {
        toast.success("Payment successful!", { id: toastID });

        // 2. Trigger the parent's onSubmit logic (e.g., redirect or show success UI)
        if (onSubmit) {
          onSubmit();
        }
      } else {
        // Handle logic errors from the server (e.g., capture failed)
        toast.error(result.error || "Payment approval failed", { id: toastID });
      }
    } catch (error: unknown) {
      // Handle network or unexpected errors
      console.error("onApprove Error:", error);
      toast.error("An unexpected error occurred during approval.", {
        id: toastID,
      });
    } finally {
      setIsApprovingOrder(false);
    }
  }

  return (
    <div className="relative">
      {isCreatingOrder && (
        <div className="absolute inset-0 bg-white/90 flex justify-center rounded z-10">
          <div className="text-small text-gray-600"> Creating Order...</div>
        </div>
      )}
      {isApprovingOrder && (
        <div className="absolute inset-0 bg-white/90 flex justify-center rounded z-10">
          <div className="text-small text-gray-600">Verifying Payment.....</div>
        </div>
      )}
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        key={appointmentId}
        disabled={disabled}
        style={{
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "pay",
        }}
        onError={(err) => {
          console.log("Paypal checkout error : ", err);
        }}
      />
    </div>
  );
};

export default PaypalCheckout;
