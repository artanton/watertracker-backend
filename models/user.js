import { Schema, model } from "mongoose";
import Joi from "joi";
import { handleMongooseError } from "../helpers/handleMongooseError.js";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: emailRegexp,
      unique: true,
      required: [true, "Email is required"],
    },
    userName: {
      type: String,
      match: [
        /^[a-zA-Z]+$/,
        "User name can contain only alphabet characters without spaces, punctuation and numbers",
      ],
      maxlength: [64, "User name should not exceed 64 characters"],
      default: null,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 64,
      required: [true, "Password is required"],
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      default: null,
    },

    gender: {
      type: String,
      enum: {
        values: ["Man", "Woman", null],
        message: 'Gender value is not valid, it can only be "Man" or "Woman"',
      },
      default: null,
    },
    dailyNorm: {
      type: Number,
      min: [0, "Daily norm value cannot be less than 0 ml"],
      max: [15000, "Daily norm value cannot be more than 15000 ml"],
      default: 2000,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

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
    .regex(/^[a-zA-Z]+$/)
    .message(
      "User name can contain only alphabet characters without spaces, punctuation and numbers"
    )
    .max(64)
    .message("User name should not exceed 64 characters"),
  gender: Joi.string().valid("Man", "Woman", null).messages({
    "any.only": '"gender" must be either Man or Woman',
  }),
  dailyNorm: Joi.number().min(0).max(15000).messages({
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

export const User = model("user", userSchema);
