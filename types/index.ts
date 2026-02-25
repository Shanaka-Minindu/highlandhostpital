import { Department,BannerImage } from "../lib/generated/prisma/client";

export interface ServerActionResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorType?: string;
}

export interface DepartmentData extends Department {}

export interface DoctorData {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
}

export interface TestimonialDataTyp {
  id: string;
  patientName: string;
  rating: number;
  testimonialText: string;
  reviewDate: string;
  patientImage?: string;
}


export interface BannerImageTyp extends BannerImage{

}