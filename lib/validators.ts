import { z } from "zod";
import { parse, isValid } from "date-fns";

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
  name: z.string().min(4, "Name must be at least 4 characters long."),

  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits.")
    .regex(
      /^07\d{8}$/,
      "Phone number must start with '07' followed by 8 digits.",
    ),

  address: z.string().optional().or(z.literal("")), // Handles empty strings from forms

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

export const reviewSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor ID format."),

  appointmentId: z.string().uuid("Invalid appointment ID format."),

  patientId: z.string().uuid("Invalid patient ID format."),

  rating: z
    .number({
      error: "Rating must be a number.",
    })
    .int("Rating must be a whole number.") // Disallows decimals
    .min(1, "Minimum rating is 1.")
    .max(5, "Maximum rating is 5."),

  testimonialText: z
    .string()
    .min(10, "Your review must be at least 10 characters.")
    .max(150, "Your review cannot exceed 150 characters."),
});

// 1. Reusable Phone Validation Schema
const phoneValidationSchema = z
  .string()
  .length(10, "Phone number must be exactly 10 digits.")
  .regex(/^07\d{8}$/, "Phone number must start with 07 and contain only numbers.");

// 2. Reusable Date String Schema (DD/MM/YYYY)
const validDateString = z
  .string()
  .min(1, "Date is required.")
  .refine((val) => {
    // Parse the string using the specific format
    const parsedDate = parse(val, "dd/MM/yyyy", new Date());
    // Ensure it's a valid calendar date (e.g., rejects Feb 30th)
    return isValid(parsedDate);
  }, "Invalid date. Please use DD/MM/YYYY format.");

// 3. Base Schema (Common Fields)
const baseSchema = z.object({
  email: z.string().email("Invalid email address.").readonly(), // Read-only handled by UI, validated here
  reason: z.string().min(1, "Reason for visit is required."),
  notes: z.string().optional(),
  useAlternatePhone: z.boolean().optional(),
  phone: z.string().optional(),
});

// 4. MYSELF Schema
const mySelfSchema = baseSchema.extend({
  patientType: z.literal("MYSELF"),
  fullName: z.string().min(1, "Full name is required."),
  dateOfBirth: z.string().optional(),
  relationship: z.string().optional(),
});

// 5. SOMEONE_ELSE Schema
const someoneElseSchema = baseSchema.extend({
  patientType: z.literal("SOMEONE_ELSE"),
  fullName: z.string().min(1, "Full name is required."),
  relationship: z.string().min(1, "Relationship is required."),
  dateOfBirth: validDateString, // Required and validated
});

// 6. Final Combined Schema with Conditional Validation
export const patientDetailsSchema = z
  .discriminatedUnion("patientType", [mySelfSchema, someoneElseSchema])
  .superRefine((data, ctx) => {
    // Check if alternate phone is checked
    if (data.useAlternatePhone) {
      const phoneResult = phoneValidationSchema.safeParse(data.phone);
      
      if (!phoneResult.success) {
        // Attach the error to the 'phone' field specifically
        phoneResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ["phone"],
          });
        });
      }
    }
  });