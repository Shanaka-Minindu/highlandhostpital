
"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUpWithCredentials } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignUpFormClient = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [state, formAction, isPending] = useActionState(signUpWithCredentials, {
    success: false,
    message: "",
  });   

  const [getInputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...getInputs, [e.target.name]: e.target.value });
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callBackUrl" value={callbackUrl} />

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          value={getInputs.name}
          onChange={handleChange}
          required
          className={state.fieldErrors?.name ? "border-red-500" : ""}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@mail.com"
          value={getInputs.email}
          onChange={handleChange}
          required
          className={state.fieldErrors?.email ? "border-red-500" : ""}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={getInputs.password}
          onChange={handleChange}
          required
          className={state.fieldErrors?.password ? "border-red-500" : ""}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={getInputs.confirmPassword}
          onChange={handleChange}
          required
          className={state.fieldErrors?.confirmPassword ? "border-red-500" : ""}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-xs text-red-500 font-medium">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 py-6 text-base font-semibold hover:bg-blue-600"
        >
          {isPending ? "Creating account..." : "Sign Up"}
        </Button>

        {state.error && !state.fieldErrors && (
          <p className="mt-2 text-center text-sm text-red-500 font-medium">
            {state.error}
          </p>
        )}
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-text-body">Already have an account? </span>
        <Link
          href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
          className="font-semibold text-blue-500 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </form>
  );
};

export default SignUpFormClient;