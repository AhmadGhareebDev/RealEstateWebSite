// schemas/authSchemas.js
const { z } = require('zod');


const registerUserSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  email: z.email().toLowerCase(),
  password: z.string().min(6),
  phone: z.string().min(8).max(20),
  location: z.string().min(2).trim(),
  profileImage: z.string().url().optional()
});


const registerAgentSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  email: z.email().toLowerCase(),
  password: z.string().min(6),
  phone: z.string().min(8).max(20),
  location: z.string().min(2).trim(),
  licenseNumber: z.string().min(3).max(50).trim(),
  licenseState: z.string().length(2).uppercase().trim(),
  fullName: z.string().min(3).max(100).trim(),
  brokerage: z.string().max(200).trim().optional()
});

const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6)
});

const verifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().length(6)
});

module.exports = {
  registerUserSchema,
  registerAgentSchema,
  loginUserSchema,
  verifyEmailSchema
};