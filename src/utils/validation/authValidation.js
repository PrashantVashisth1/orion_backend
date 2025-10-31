import Joi from 'joi';

export const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().min(8).max(20).optional().allow(''),
  password: Joi.string().min(1).max(100).required(),
  confirmPassword: Joi.ref('password'),
  role: Joi.string()
    .valid("STARTUP", "INVESTOR", "MENTOR", "STUDENT", "ADMIN")
    .default("STARTUP"), // optional default
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});