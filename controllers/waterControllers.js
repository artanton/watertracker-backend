import { Water } from "../models/water.js";
import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const addWater = async (req, res) => {
  const { _id: owner, dalyNorma: userDalyNorma } = req.user;

  const { date, waterDose } = req.body;
  const dateWithoutTime = new Date(date).toISOString().substring(0, 10);

  const ToDayWaterData = await Water.findOne({ owner, date: dateWithoutTime });

  if (!ToDayWaterData) {
    const waterRate = Math.round((waterDose / userDalyNorma) * 100);

    const result = await Water.create({
      ...req.body,
      owner,
      date: dateWithoutTime,
      waterTotal: waterDose,
      persantRate: waterRate,
      dailyWaterInfo: [
        {
          createdDate: date,
          waterDose,
        },
      ],
    });

    res.status(201).json(result);
  } else {
    const { _id: id, dalyNorma, waterTotal } = ToDayWaterData;

    const result = await Water.findOneAndUpdate(
      { _id: id },
      {
        $push: { dailyWaterInfo: { createdDate: date, waterDose } },
        $inc: { waterTotal: +waterDose},
        $set: { 
          persantRate: Math.round((waterTotal + waterDose) / dalyNorma * 100)}
        
      },
      { new: true }
      
    );
 
    res.status(200).json(result);
  }
};

export default {
  addWater: ctrlWrapper(addWater),
};
