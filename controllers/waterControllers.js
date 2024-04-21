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
  const year = searchedDate.getFullYear();
  const monthNo = searchedDate.getMonth();

  const startOfMonth = new Date(
    searchedDate.getFullYear(),
    searchedDate.getMonth(),
    2
  ).toISOString();
  const endOfMonth = new Date(
    searchedDate.getFullYear(),
    searchedDate.getMonth() + 1,
    2
  ).toISOString();

  const rawData = await Water.find({
    owner,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const daysOfMonth = getDaysOfMonth(year, monthNo);

  const data = daysOfMonth.map((day) => {
    const dayData = rawData.find((item) => {
      const itemDate = Number(item.date.toString().slice(8, 10));

      return itemDate === day;
    });

    const formattedDay = day.toString().padStart(2, "0");
    const formattedMonth = `${monthNo + 1}`.toString().padStart(2, "0");
    const date = `${year}-${formattedMonth}-${formattedDay}`;

    if (dayData) {
      return {
        _id: dayData._id,
        date: dayData.date,
        dailyNorma: dayData.dailyNorma,
        persantRate: dayData.persantRate,
        waterSavings: dayData.waterSavings,
      };
    } else {
      return {
        date: date,
        dailyNorma: 0,
        persantRate: 0,
        waterSavings: 0,
      };
    }
  });

  res.status(200).json(data);
};

const getDaysOfMonth = (year, month) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

export default {
  addWater: ctrlWrapper(addWater),
  today: ctrlWrapper(today),
  deleteWaterRecord: ctrlWrapper(deleteWaterRecord),
  updateWaterDose: ctrlWrapper(updateWaterDose),
  month: ctrlWrapper(month),
};
