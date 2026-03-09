import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email not valid.")
    .min(4, "Email too short"),
  password: z
    .string()
    .min(3, "Password too short"),
});


export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(6, "Name must be at least 6 characters long."),
    email: z
      .string()
      .email("Email not valid.")
      .min(4, "Email too short."),
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