"use server";
import { ServerActionResponse } from "@/types";
import { loginSchema, signUpSchema } from "../validators";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts";

export async function signInWithCredentials(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any,
  formData: FormData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerActionResponse<any>> {
  // 1. Extract data from FormData
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = (formData.get("callBackUrl") as string) || "/";

  // 2. Validate with Zod
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });

  // 3. Handle validation errors
  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    return {
      success: false,
      message: firstError.message,
      error: "Validation Error",
      errorType: "ValidationErrors",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 4. Attempt to sign in
  try {
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirectTo,
    });

    return {
      success: true,
      message: "Logged in successfully!",
    };
  } catch (error) {
    // Auth.js throws specific errors for redirects; we need to re-throw them
    // or Next.js won't actually redirect the user.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid credentials.",
            errorType: "AuthError",
          };
        default:
          return {
            success: false,
            error: "Something went wrong.",
            errorType: "AuthError",
          };
      }
    }

    throw error; // Essential for the redirect to work!
  }
}


export async function signUpWithCredentials(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state:any,
  formData: FormData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ServerActionResponse<any>> {
  // 1. Extract and Parse Data
  const rawData = Object.fromEntries(formData.entries());
  const callbackUrl = (formData.get("callBackUrl") as string) || "/";

  // 2. Validate with Zod
  const validatedFields = signUpSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid form data.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      errorType: "ValidationError",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 3. Check for Existing User
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists.",
        errorType: "UserExistsError",
      };
    }

    // 4. Hash Password and Create User
    const hashedPassword = hashSync(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 5. Trigger Auto Sign-In
    // This will throw a redirect error on success, which Next.js handles.
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });

    return {
      success: true,
      message: "User registered successfully!",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Account created, but failed to sign in automatically.",
        errorType: "AuthError",
      };
    }

    // If it's a redirect error from Auth.js, re-throw it so Next.js can perform the redirect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Signup Error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration.",
      errorType: "DatabaseError",
    };
  }
}




export async function signOutUser(): Promise<void> {
  try {
    await signOut({ redirect: true, redirectTo: "/" });
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    throw new Error("Sign out failed on the server");
  }
}
