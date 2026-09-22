const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(6, "Phone is required"),

  role: z.enum(["general", "volunteer"]).optional(),
  bio: z.string().max(500).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { signupSchema, loginSchema };