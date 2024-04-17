import { Water } from "../models/water.js";
import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const addWater = async (req, res) => {
  const { _id: owner, dailyNorma: userDailyNorma } = req.user;

  const { date, waterDose } = req.body;
  const dateWithoutTime = new Date(date).toISOString().substring(0, 10);

  const ToDayWaterData = await Water.findOne({ owner, date: dateWithoutTime });

  if (!ToDayWaterData) {
    const data = {
      createdDate: date,
      waterDose
    };
    const waterRate = Math.round((waterDose / userDailyNorma) * 100);

    const result = await Water.create({
      
      owner,
      date: dateWithoutTime,
      waterTotal: waterDose,
      persantRate: waterRate,
      dailyNorma: userDailyNorma,
      dailyWaterInfo: [
        data
      ],
    });

    res.status(201).json(result);
  } else {
   
    const { _id: id,  waterTotal } = ToDayWaterData;

    const result = await Water.findOneAndUpdate(
      { _id: id },
      {
        $push: { dailyWaterInfo: { createdDate: date, waterDose } },
        $inc: { waterTotal: +waterDose},
        $set: { 
          persantRate: Math.round((waterTotal + waterDose) / userDailyNorma * 100)}
        
      },
      { new: true }
      
    );
 
    res.status(200).json(result);
  }
};

const today = async (req, res) => {
  const { id } = req.params;
  const {_id: owner}=req.user;
  const result = await Water.findOne({_id:id, owner});
  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json(result);
};

const deleteWaterDose = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const dateWithoutTime = new Date().toISOString().substring(0, 10);
  const ToDayWaterData = await Water.findOne({ owner, date: dateWithoutTime });

  if (!ToDayWaterData) {
    return res.status(404).json({ error: 'Data not found' });
  }

  const updatedWaterData = await Water.findOneAndUpdate(
     {'dailyWaterInfo._id': id },
      {
        $inc: { waterTotal: -waterDose},
        $pull: { dailyWaterInfo: { _id: id }},
        $set: { 
          persantRate: Math.round((waterTotal + waterDose) / userDailyNorma * 100)}
        
      },
    { new: true }
  );

  
  res.json({ message: 'Delete success' });
};


export default {
  addWater: ctrlWrapper(addWater),
  today: ctrlWrapper(today),
  deleteWaterDose: ctrlWrapper(deleteWaterDose),
};
