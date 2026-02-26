"use server";
import { DoctorData, DoctorTopCard, ServerActionResponse } from "@/types";
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


export async function getDoctorById(id:string):Promise<ServerActionResponse<DoctorTopCard>> {
  try {
    // 1. Fetch the user with their nested doctorProfile
    const doctor = await prisma.user.findUnique({
      where: { 
        id: id,
        role: "DOCTOR" // Security check to ensure we only get doctors
      },
      include: {
        doctorProfile: true,
      },
    });

    // 2. Check if doctor exists and has a profile
    if (!doctor || !doctor.doctorProfile) {
      return {
        success: false,
        error: "Doctor not found or profile is incomplete.",
        errorType: "NOT_FOUND",
      };
    }

    // 3. Map the database result to the DoctorTopCard interface
    const formattedData: DoctorTopCard = {
      id: doctor.id,
      image: doctor.image,
      name: doctor.name,
      specialty: doctor.doctorProfile.specialty,
      brief: doctor.doctorProfile.brief,
      credentials: doctor.doctorProfile.credentials,
      languages: doctor.doctorProfile.languages,
      rating: doctor.doctorProfile.rating,
      reviewCount: doctor.doctorProfile.reviewCount,
      specializations: doctor.doctorProfile.specializations,
    };

    return {
      success: true,
      message: "Doctor details retrieved successfully",
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    return {
      success: false,
      error: "An error occurred while fetching doctor details.",
      errorType: "DATABASE_ERROR",
    };
  }
}