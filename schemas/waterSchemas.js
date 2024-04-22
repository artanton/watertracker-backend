import Joi from "joi";

export const waterSchema = Joi.object({
  date: Joi.date().required(),
  waterDose: Joi.number().min(50).max(5000).required(),
});

export const waterUpdateSchema = Joi.object({
  createdDate: Joi.date().required(),
  waterDose: Joi.number().min(50).max(5000).required(),
});

export const waterRateSchema = Joi.object({
  dailyNorma: Joi.number().min(50).max(15000).required(),
});
