import { ServerActionResponse, TestimonialDataTyp } from "@/types";
import { prisma } from "@/db/prisma";

export async function getTestimonials(): Promise<ServerActionResponse<TestimonialDataTyp[]>>{
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
    const formattedTestimonials: TestimonialDataTyp[] = testimonials.map((t) => ({
      id: t.testimonialId,
      testimonialText: t.testimonialText,
      rating: t.rating ?? 0,
      reviewDate: t.createdAt.toISOString(),
      patientName: t.patient?.name ?? "Anonymous Patient",
      patientImage: t.patient?.image ?? undefined,
    }));

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