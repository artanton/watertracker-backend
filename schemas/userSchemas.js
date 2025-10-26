import Joi from "joi";
import { emailRegexp } from "../helpers/validators.js";

export const avatarSchema = Joi.object({
  avatarURL: Joi.string().uri(),
});

export const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(8).max(64).required().messages({
    "string.min": '"password" must be at least 8 characters long',
    "string.max": '"password" must be less than or equal to 64 characters long',
    "any.required": '"password" is a required field',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(8).max(64).required().messages({
    "string.min": '"password" must be at least 8 characters long',
    "string.max": '"password" must be less than or equal to 64 characters long',
    "any.required": '"password" is a required field',
  }),
});

export const userSettingsSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp),
  userName: Joi.string()
    .max(64)
    .message("User name should not exceed 64 characters"),
  gender: Joi.string().valid("Man", "Woman", null).messages({
    "any.only": '"gender" must be either Man or Woman',
  }),
  dailyNorma: Joi.number().min(0).max(15000).messages({
    "number.min": "Daily norma must be larger than or equal to 0 ml",
    "number.max": "Daily norma must be less than or equal to 15000 ml",
  }),
  avatarURL: Joi.string().uri(),
  oldPassword: Joi.string().allow(""),
  newPassword: Joi.string()
    .allow("")
    .when("oldPassword", {
      is: Joi.exist().not(""),
      then: Joi.required(),
    }),
})
  .with("newPassword", "oldPassword")
  .messages({
    "object.with": "Outdated password is required",
  });
