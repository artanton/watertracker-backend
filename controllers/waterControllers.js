import { Water } from "../models/water.js";
import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const addWater = async (req, res) => {
  const { _id: owner, dailyNorma: userDailyNorma } = req.user;

  const { date, waterDose } = req.body;
  const actualDate = new Date(date).toISOString();

  const ToDayWaterData = await Water.findOne({ owner, date: actualDate });

  if (!ToDayWaterData) {
    const data = {
      createdDate: date,
      waterDose,
    };
    const waterRate = Math.round((waterDose / userDailyNorma) * 100);

    const result = await Water.create({
      owner,
      date: actualDate,
      waterTotal: waterDose,
      persantRate: waterRate,
      dailyNorma: userDailyNorma,
      waterSavings: 1,
      dailyWaterInfo: [data],
    });

    res.status(201).json(result);
  } else {
    const { _id: id, waterTotal, waterSavings } = ToDayWaterData;

    const result = await Water.findOneAndUpdate(
      { _id: id },
      {
        $push: { dailyWaterInfo: { createdDate: date, waterDose } },
        $inc: { waterTotal: +waterDose, waterSavings: 1 },
        $set: {
          persantRate: Math.round(
            ((waterTotal + waterDose) / userDailyNorma) * 100
          ),
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  }
};

const today = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Water.findOne({ _id: id, owner });
  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json(result);
};

const deleteWaterRecord = async (req, res) => {
  const { id } = req.params;
  const { _id: owner, dailyNorma: userDailyNorma } = req.user;

  const actualDate = new Date().toISOString();
  let ToDayWaterData = await Water.findOne({ owner, date: actualDate });

  const waterRecord = ToDayWaterData.dailyWaterInfo.find(
    (option) => option.id === id
  );

  const { waterTotal } = ToDayWaterData;

  const deletedWaterDose = waterRecord.waterDose;

  ToDayWaterData = await Water.updateOne(
    { owner, date: actualDate },
    {
      $inc: { waterTotal: -deletedWaterDose, waterSavings: -1 },
      $pull: { dailyWaterInfo: { _id: id } },
      $set: {
        persantRate: Math.round(
          ((waterTotal - deletedWaterDose) / userDailyNorma) * 100
        ),
      },
    },
    { new: true }
  );

  return res.json({ message: "Delete success" });
};

const updateWaterDose = async (req, res) => {
  const { id } = req.params;
  const { _id: owner, dailyNorma: userDailyNorma } = req.user;
  const { waterDose: newWaterDose, createdDate } = req.body;

  const actualDate = new Date(createdDate).toISOString();

  let ToDayWaterData = await Water.findOne({ owner, date: actualDate });

  let waterRecord = ToDayWaterData.dailyWaterInfo.find(
    (option) => option.id === id
  );

  const { waterTotal } = ToDayWaterData;

  const oldWaterDose = waterRecord.waterDose;
  const newCreatedDate = new Date(createdDate).toISOString();

  const waterDoseShift = oldWaterDose - newWaterDose;

  ToDayWaterData = await Water.findOneAndUpdate(
    { "dailyWaterInfo._id": id },
    {
      $inc: { waterTotal: -waterDoseShift },
      $set: {
        persantRate: Math.round(
          ((waterTotal - waterDoseShift) / userDailyNorma) * 100
        ),
        "dailyWaterInfo.$.waterDose": newWaterDose,
        "dailyWaterInfo.$.createdDate": newCreatedDate,
      },
    },

    { new: true }
  );
  waterRecord = ToDayWaterData.dailyWaterInfo.find(
    (option) => option.id === id
  );

  res.status(200).json(waterRecord);
};

const month = async (req, res) => {
  const { _id: owner } = req.user;
  const { date } = req.query;

  const searchedDate = new Date(date);


  const startOfMonth = new Date(searchedDate.getFullYear(), searchedDate.getMonth(), 2).toISOString();
const endOfMonth = new Date(searchedDate.getFullYear(), searchedDate.getMonth()+1, 2).toISOString();


const rawData = await Water.find({owner, date: { $gte: startOfMonth, $lte: endOfMonth } })

const data= rawData.map(waterByDay=>({
  _id: waterByDay._id,
  date: new Date(waterByDay.date).toISOString().substring(0, 10),
  dailyNorma: waterByDay.dailyNorma,
  persantRate: waterByDay.persantRate,
  waterSavings: waterByDay.waterSavings}))
console.log(data);

res.status(200).json(data)
};

export default {
  addWater: ctrlWrapper(addWater),
  today: ctrlWrapper(today),
  deleteWaterRecord: ctrlWrapper(deleteWaterRecord),
  updateWaterDose: ctrlWrapper(updateWaterDose),
  month: ctrlWrapper(month),
};
