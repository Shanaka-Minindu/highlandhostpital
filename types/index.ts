import z from "zod";
import { Department, BannerImage } from "../lib/generated/prisma/client";
import { patientProfileUpdateSchema } from "@/lib/validators";

export type FieldErrors = Record<string, string[] | undefined>;

export interface ServerActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorType?: string;
  fieldErrors?: FieldErrors;
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

export interface BannerImageTyp extends BannerImage {}

export interface DoctorTopCard {
  id: string;
  image: string | null;
  name: string;
  specialty: string;
  brief: string;
  credentials: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  specializations: string[];
}

export interface DoctorAbout {
  name: string;
  brief: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  startTimeUTC: Date;
  endTimeUTC: Date;
}

export interface PatientProfile {
  id: string;
  name: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  email: string;
  address?: string;
  image?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  doctorId: string;
  specialty?: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled" | "no show" | "cash payment";
  reasonForVisit: string;
  isReviewed: boolean;
}

export type PatientProfileUpdateInput = z.Infer<typeof patientProfileUpdateSchema>
