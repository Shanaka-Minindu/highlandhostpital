"use server";
import { Appointment, PatientProfile, PatientProfileUpdateInput, ServerActionResponse } from "@/types";
import { loginSchema, patientProfileUpdateSchema, signUpSchema } from "../validators";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts";
import { auth } from "@/auth";
import { formatInTimeZone } from "date-fns-tz";
import { getAppTimeZone } from "../config";
import { extractFileKey } from "../uploadthing-helper";
import { UTApi } from "uploadthing/server";
import { revalidatePath } from "next/cache";

const utapi = new UTApi();

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
  state: any,
  formData: FormData,
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

export async function getUserDetails(): Promise<
  ServerActionResponse<PatientProfile>
> {
  try {
    // 1. Check for an active session
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "user not authenticated",
        error: "Unauthorized. Please log in to view profile details.",
        errorType: "UNAUTHORIZED",
      };
    }

    // 2. Fetch the user from the database using the session ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        dateofbirth: true,
        address: true,
        image: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User profile not found.",
        error: `User profile not found : ${session.user.id}`,
        errorType: "NOT_FOUND",
      };
    }

    // 3. Map the database fields to your PatientProfile type
    // Convert Date objects to strings if necessary to match the interface
    const patientData: PatientProfile = {
      id: user.id,
      name: user.name || "",
      email: user.email,
      phoneNumber: user.phoneNumber ?? undefined,
      dateOfBirth: user.dateofbirth?.toISOString().split("T")[0] ?? undefined,
      address: user.address ?? undefined,
      image: user.image ?? undefined,
    };

    return {
      success: true,
      message: "User details retrieved successfully.",
      data: patientData,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An internal server error occurred.",
      errorType: "SERVER_ERROR",
    };
  }
}

interface UserAppointmentsData {
  appointment: Appointment[];
  totalAppointment: number;
  totalPages: number;
  currentPage: number;
}

export async function getUserAppointments(params?: {
  page?: number;
  limit?: number;
}): Promise<ServerActionResponse<UserAppointmentsData>> {
  try {
    // 1. Authenticate User
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", errorType: "AUTH_ERROR" };
    }

    const userId = session.user.id;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;
    const timeZone = getAppTimeZone();

    // 2. Fetch Data & Total Count (excluding PAYMENT_PENDING)
    const [rawAppointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          userId: userId,
          NOT: { status: "PAYMENT_PENDING" },
        },
        include: {
          doctor: {
            include: {
              doctorProfile: true,
            },
          },
          testimonial: true,
        },
        orderBy: { appointmentStartUTC: "desc" },
        skip: skip,
        take: limit,
      }),
      prisma.appointment.count({
        where: {
          userId: userId,
          NOT: { status: "PAYMENT_PENDING" },
        },
      }),
    ]);

    // 3. Status Mapping Helper
    const statusMap: Record<string, Appointment["status"]> = {
      BOOKING_CONFIRMED: "upcoming",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
      NO_SHOW: "no show",
      CASH: "cash payment",
    };

    // 4. Transform Data
    const formattedAppointments: Appointment[] = rawAppointments.map((apt) => ({
      id: apt.appointmentId,
      doctorName: apt.doctor.name,
      doctorId: apt.doctorId,
      specialty: apt.doctor.doctorProfile?.specialty ?? "General",
      // Convert UTC to App Timezone and format
      date: formatInTimeZone(apt.appointmentStartUTC, timeZone, "MMMM d, yyyy"),
      time: formatInTimeZone(apt.appointmentStartUTC, timeZone, "hh:mm a"),
      status: statusMap[apt.status] || "upcoming",
      reasonForVisit: apt.reasonForVisit || "General Checkup",
      isReviewed: !!apt.testimonial, // true if testimonial exists
    }));

    return {
      success: true,
      data: {
        appointment: formattedAppointments,
        totalAppointment: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load appointments",
      errorType: "DATABASE_ERROR",
    };
  }
}

export async function updateUserImage(
  imageUrl: string,
): Promise<ServerActionResponse<null>> {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized",message:"User not authorized", errorType: "AUTH_ERROR" };
    }

    const userId = session.user.id;

    // 2. Get the current user to check for an existing image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const oldImageUrl = user.image;

    // 3. Update the user table with the new image URL
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    // 4. Cleanup: If there was an old image, extract key and delete from UploadThing
    if (oldImageUrl) {
      const fileKey = extractFileKey(oldImageUrl);

      if (fileKey) {
        try {
          // Delete from UploadThing servers
          await utapi.deleteFiles(fileKey);
        } catch (deleteError) {
          // We log this but don't fail the whole action,
          // as the DB update was already successful.
          console.error(
            "Failed to delete old image from storage:",
            deleteError,
          );
        }
      }
    }

    // 5. Revalidate the path to show the new image immediately
    revalidatePath("/user/profile"); // Adjust this path to your profile or settings page if needed

    return {
      success: true,
      message: "Profile image updated successfully",
    };
  } catch (error) {
    console.error("UPDATE_USER_IMAGE_ERROR", error);
    return {
      success: false,
      message: "Failed you update profile picture, Please try again later",
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the image",
          errorType:"SERVER_ERROR"
    };
  }
}


export async function patientProfileUpdate(
  data: PatientProfileUpdateInput
): Promise<ServerActionResponse<null>> {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to update your profile.",
        errorType: "UNAUTHORIZED",
      };
    }

    // 2. Validate data with Zod
    const validatedFields = patientProfileUpdateSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid form data.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
        errorType: "VALIDATION_ERROR",
      };
    }

    const { name, phoneNumber, address, dateofbirth } = validatedFields.data;

    // 3. Prepare data for Prisma
    // Convert string date from form to JavaScript Date object
    const formattedDob = dateofbirth ? new Date(dateofbirth) : null;

    // 4. Update the User model
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        phoneNumber,
        address,
        dateofbirth: formattedDob,
      },
    });

    // 5. Revalidate cache to show updated data in the UI
    revalidatePath("/user/profile"); // Adjust to your actual profile route

    return {
      success: true,
      message: "Profile updated successfully!",
      data: null,
    };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return {
      success: false,
      message: "Something went wrong while updating your profile.",
      error: error instanceof Error ? error.message : "Internal Server Error",
      errorType: "DATABASE_ERROR",
    };
  }
}