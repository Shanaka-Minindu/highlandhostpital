import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email not valid.").min(4, "Email too short"),
  password: z.string().min(3, "Password too short"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(6, "Name must be at least 6 characters long."),
    email: z.string().email("Email not valid.").min(4, "Email too short."),
    password: z
      .string()
      .min(4, "Password must be at least 4 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z
      .string()
      .min(4, "Confirm password must be at least 4 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // This sets the error specifically on the confirmPassword field
  });




export const patientProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(4, "Name must be at least 4 characters long."),
  
  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits.")
    .regex(/^07\d{8}$/, "Phone number must start with '07' followed by 8 digits."),
  
  address: z
    .string()
    .optional()
    .or(z.literal("")), // Handles empty strings from forms

  dateofbirth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true; // It's optional, so skip if empty
      const date = new Date(val);
      return !isNaN(date.getTime()); // Ensure it's a valid date string
    }, "Invalid date format.")
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      return date <= now;
    }, "Date of birth cannot be in the future.")
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      return date >= minDate;
    }, "Date of birth cannot be more than 120 years ago."),
});