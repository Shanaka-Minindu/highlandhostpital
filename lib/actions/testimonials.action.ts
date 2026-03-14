"use server";
import { ServerActionResponse, TestimonialDataTyp } from "@/types";
import { prisma } from "@/db/prisma";
import { reviewSchema } from "../validators";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getTestimonials(): Promise<
  ServerActionResponse<TestimonialDataTyp[]>
> {
  try {
    const testimonials = await prisma.doctorTestimonial.findMany({
      include: {
        patient: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Show newest reviews first
      },
    });

    // Transform database results into the TestimonialDataTyp interface
    const formattedTestimonials: TestimonialDataTyp[] = testimonials.map(
      (t) => ({
        id: t.testimonialId,
        testimonialText: t.testimonialText,
        rating: t.rating ?? 0,
        reviewDate: t.createdAt.toISOString(),
        patientName: t.patient?.name ?? "Anonymous Patient",
        patientImage: t.patient?.image ?? undefined,
      }),
    );

    return {
      success: true,
      message: "Testimonials retrieved successfully",
      data: formattedTestimonials,
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return {
      success: false,
      error: "Failed to load testimonials. Please try again.",
      errorType: "DATABASE_ERROR",
    };
  }
}

interface paginated {
  currentPage: number;
  totalReviews: number;
  totalPages: number;
  reviews: TestimonialDataTyp[];
}

export async function getDoctorReviewPaginated(
  pageSize: number = 10,
  page: number = 1,
  doctorId: string,
): Promise<ServerActionResponse<paginated>> {
  try {
    // 1. Calculate how many records to skip
    const skip = (page - 1) * pageSize;

    // 2. Run count and findMany in parallel for better performance
    const [totalReviews, reviewsData] = await Promise.all([
      prisma.doctorTestimonial.count({
        where: { doctorId },
      }),
      prisma.doctorTestimonial.findMany({
        where: { doctorId },
        include: {
          patient: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Latest reviews first
        },
        skip: skip,
        take: pageSize,
      }),
    ]);

    // 3. Calculate total pages
    const totalPages = Math.ceil(totalReviews / pageSize);

    // 4. Format the data to match your TestimonialDataTyp
    const formattedReviews: TestimonialDataTyp[] = reviewsData.map(
      (review) => ({
        id: review.testimonialId,
        patientName: review.patient?.name || "Anonymous",
        rating: review.rating ?? 0,
        testimonialText: review.testimonialText,
        reviewDate: review.createdAt.toISOString(),
        patientImage: review.patient?.image || undefined,
      }),
    );

    return {
      success: true,
      message: "Reviews fetched successfully",
      data: {
        currentPage: page,
        totalReviews,
        totalPages,
        reviews: formattedReviews,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated reviews:", error);
    return {
      success: false,
      message: "Failed to fetch doctor review",
      error:
        error instanceof Error
          ? error.message
          : "Failed to load reviews. Please try again.",
      errorType: "PAGINATION_ERROR",
    };
  }
}

export async function createNewTestimonial(clientData: {
  doctorId: string;
  appointmentId: string;
  rating: number;
  testimonialText: string;
}): Promise<ServerActionResponse<null>> {
  try {
    // 1. Get Patient ID from Session
    const session = await auth();
    const patientId = session?.user?.id;

    if (!patientId) {
      return {
        success: false,
        message: "You must be logged in to leave a review.",
        errorType: "UNAUTHORIZED",
      };
    }

    // 2. Validate Data with Zod
    const validatedFields = reviewSchema.safeParse({
      ...clientData,
      patientId,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid review data.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
        errorType: "VALIDATION_ERROR",
      };
    }

    const { doctorId, appointmentId, rating, testimonialText } =
      validatedFields.data;

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      select: { status: true, userId: true, doctorId: true },
    });

    if (!appointment || appointment.status !== "COMPLETED") {
      return {
        success: false,
        message: "You can only review completed appointments.",
        errorType: "INVALID_APPOINTMENT",
      };
    }

    if (appointment.userId !== patientId) {
      return {
        success: false,
        message: "You are not authorized to review this appointment.",
        errorType: "FORBIDDEN",
      };
    }

    // 3. Database Transaction
    await prisma.$transaction(async (tx) => {
      // Check if testimonial already exists for this appointment
      const existing = await tx.doctorTestimonial.findUnique({
        where: { appointmentId },
      });

      if (existing) {
        throw new Error(
          "A review has already been submitted for this appointment.",
        );
      }

      // A. Create the Testimonial
      await tx.doctorTestimonial.create({
        data: {
          appointmentId,
          doctorId,
          patientId,
          rating,
          testimonialText,
        },
      });

      // B. Fetch Current Doctor Profile
      const profile = await tx.doctorProfile.findUnique({
        where: { userId: doctorId },
      });

      if (!profile) {
        throw new Error("Doctor profile not found.");
      }

      // C. Calculate New Average Rating
      // Formula: ((Current Rating * Current Count) + New Rating) / (Current Count + 1)
      const newReviewCount = profile.reviewCount + 1;
      const newAverageRating =
        (profile.rating * profile.reviewCount + rating) / newReviewCount;

      // D. Update Doctor Profile
      await tx.doctorProfile.update({
        where: { userId: doctorId },
        data: {
          rating: newAverageRating,
          reviewCount: newReviewCount,
        },
      });
    });

    // 4. Revalidate cache
    revalidatePath(`/user/profile`);

    return {
      success: true,
      message: "Thank you! Your review has been submitted.",
      
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "An unexpected error occurred while saving your review.";
    return {
      success: false,
      message,
      errorType: "DATABASE_ERROR",
    };
  }
}
