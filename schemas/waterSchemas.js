import Joi from "joi";


export const addWaterSchema = Joi.object({
    date: Joi.date().required(),
    waterDose: Joi.number().min(50).max(5000).required(),
   
  });