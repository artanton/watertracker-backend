import mongoose from "mongoose";
import { handleMongooseError } from "../helpers/handleMongooseError.js";

import Joi from "joi";
export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
  favorite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.number(),
  favorite: Joi.boolean(),
}).min(1);

export const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    favorite: { type: String, default: false },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

contactSchema.post("save", handleMongooseError);

export const Contact = model("contact", contactSchema);
