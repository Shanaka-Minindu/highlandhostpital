"use server"
import { ServerActionResponse, TestimonialDataTyp } from "@/types";
import { prisma } from "@/db/prisma";

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
    const formattedReviews: TestimonialDataTyp[] = reviewsData.map((review) => ({
      id: review.testimonialId,
      patientName: review.patient?.name || "Anonymous",
      rating: review.rating ?? 0,
      testimonialText: review.testimonialText,
      reviewDate: review.createdAt.toISOString(),
      patientImage: review.patient?.image || undefined,
    }));

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
      message:"Failed to fetch doctor review",
      error: error instanceof Error?error.message: "Failed to load reviews. Please try again.",
      errorType: "PAGINATION_ERROR",
    };
  }
}
