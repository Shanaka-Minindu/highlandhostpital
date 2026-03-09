
"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignInForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [state, formAction, isPending] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });

  const [getInputs, setInputs] = useState({ email: "", password: "" });

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden input to pass the callbackUrl to the server action */}
      <input type="hidden" name="callBackUrl" value={callbackUrl} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          placeholder="Enter your email"
          value={getInputs.email}
          onChange={(e) => {
            setInputs({ ...getInputs, email: e.target.value });
          }}
          required
          className={state.fieldErrors?.email ? "border-red-500" : ""}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-red-500 font-medium">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={getInputs.password}
          onChange={(e) => {
            setInputs({ ...getInputs, password: e.target.value });
          }}
          placeholder="Enter your password"
          required
          className={state.fieldErrors?.password ? "border-red-500" : ""}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-red-500 font-medium">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 py-6 text-base font-semibold hover:bg-blue-600"
        >
          {isPending ? "Signing in..." : "Sign In with credentials"}
        </Button>

        {state.error && !state.fieldErrors && (
          <p className="mt-2 text-center text-sm text-red-500 font-medium">
            {state.error}
          </p>
        )}
      </div>

      <div className="mt-8 text-center text-sm">
        <span className="text-text-body">Don&apos;t have an account? </span>
        <Link
          href={
            callbackUrl
              ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/sign-up"
          }
          className="font-semibold text-blue-500 hover:underline"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
};

export default SignInForm;
