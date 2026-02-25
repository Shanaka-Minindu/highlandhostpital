"use server";

import { BannerImageTyp, DepartmentData, ServerActionResponse } from "@/types";
import { prisma } from "@/db/prisma";

interface GetDepartmentData {
          departments:DepartmentData[]
}

export async function getDepartments(): Promise<
  ServerActionResponse<GetDepartmentData>
> {try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc', // Optional: keeps the list alphabetized for the UI
      },
    });

    return {
      success: true,
      message: "Departments retrieved successfully",
      data: {departments},
    };
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    
    return {
      success: false,
      error: error instanceof Error? error.message: "Could not fetch departments. Please try again later.",
      errorType: "DATABASE_ERROR",
    };
  }}

  export async function getBannerImg():Promise<ServerActionResponse<BannerImageTyp[]>> {
    try {
    const banners = await prisma.bannerImage.findMany({
      orderBy: {
        order: "asc", // Ensures images follow your custom sequence
      },
    });

    return {
      success: true,
      message: "Banner images retrieved successfully",
      data: banners,
    };
  } catch (error) {
    console.error("Error fetching banner images:", error);
    
    return {
      success: false,
      error: "Failed to fetch banners. Please try again later.",
      errorType: "DATABASE_ERROR",
    };
  }
  }
