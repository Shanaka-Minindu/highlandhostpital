"use server";
import { DoctorData, ServerActionResponse } from "@/types";
import { prisma } from "@/db/prisma";
import { UserRole } from "@/lib/generated/prisma";



export async function getOurDoctors():Promise<ServerActionResponse<DoctorData[]>>{
try {
    const doctors = await prisma.user.findMany({
      where: {
        role: UserRole.DOCTOR,
      
      },
      select: {
        id: true,
        name: true,
        image: true,
        doctorProfile: {
          select: {
            specialty: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    });

    // Flatten the data to match your DoctorData interface
    const formattedDoctors: DoctorData[] = doctors.map((doc) => ({
      id: doc.id,
      name: doc.name,
      imageUrl: doc.image ?? undefined,
      specialty: doc.doctorProfile?.specialty ?? "General",
      rating: doc.doctorProfile?.rating ?? 0,
      reviewCount: doc.doctorProfile?.reviewCount ?? 0,
    }));

    return {
      success: true,
      message: "Doctors fetched successfully",
      data: formattedDoctors,
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      error: "Failed to retrieve doctor list.",
      errorType: "FETCH_ERROR",
    };
  }
}