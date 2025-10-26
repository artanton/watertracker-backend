import { Schema, model } from "mongoose";

import { handleMongooseError } from "../helpers/handleMongooseError.js";
import { setUpdateSettings } from "../helpers/setUpdateSettings.js";

import { emailRegexp, userNameRegexp } from "../helpers/validators.js";
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
      maxlength: [64, "User name should not exceed 64 characters"],
      default: null,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 64,
      // required: [true, "Password is required"],
    },
    token: {
      type: String,
      default: null,
    },

    refresToken: {
      type: String,
      default: null,
    },


    avatarURL: {
      type: String,
      default:
        "https://res.cloudinary.com/dyspzb5dh/image/upload/fl_preserve_transparency/v1713620482/avatars/defaultAvatar_h0nbu6.jpg?_s=public-apps",
    },

    gender: {
      type: String,
      enum: {
        values: ["Man", "Woman", null],
        message: 'Gender value is not valid, it can only be "Man" or "Woman"',
      },
      default: null,
    },
    dailyNorma: {
      type: Number,
      min: [1000, "Daily norm value cannot be less than 1000 ml"],
      max: [15000, "Daily norm value cannot be more than 15000 ml"],
      default: 2000,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleMongooseError);

export const User = model("user", userSchema);
