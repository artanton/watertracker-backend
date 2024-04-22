import { Water } from "../models/water.js";
import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";
import { getDaysOfMonth } from "../helpers/waterHelper.js";

const addWater = async (req, res) => {
  const { _id: owner, dailyNorma: userDailyNorma } = req.user;

  const { date, waterDose } = req.body;
  const actualDate = new Date(date).toISOString().substring(0, 10);

  const toDayWaterData = await Water.findOne({ owner, date: actualDate });

  if (!toDayWaterData) {
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
      waterNotes: [data],
    });

    res.status(201).json(result);
  } else {
    const { _id: id, waterTotal, waterSavings } = toDayWaterData;

    const result = await Water.findOneAndUpdate(
      { _id: id },
      {
        $push: { waterNotes: { createdDate: date, waterDose } },
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

  const actualDate = new Date().toISOString().substring(0, 10);
  let toDayWaterData = await Water.findOne({ owner, date: actualDate });

  if (!toDayWaterData) {
    throw HttpError(404, "Not found");
  }

  let waterRecord = toDayWaterData.waterNotes.find(
    (option) => option.id === id
  );

  const { waterTotal } = toDayWaterData;

  const deletedWaterDose = waterRecord.waterDose;

  toDayWaterData = await Water.updateOne(
    { owner, date: actualDate },

    {
      $inc: { waterTotal: -deletedWaterDose, waterSavings: -1 },
      $pull: { waterNotes: { _id: id } },
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

  const actualDate = new Date(createdDate).toISOString().substring(0, 10);
  let toDayWaterData = await Water.findOne({ owner, date: actualDate });
  if (!toDayWaterData) {
    throw HttpError(404, "Not Found");
  }

  let waterRecord = toDayWaterData.waterNotes.find(
    (option) => option.id === id
  );

  if (!waterRecord) {
    throw HttpError(404, "Water dose record Not Found");
  }
  const { waterTotal } = toDayWaterData;

  const oldWaterDose = waterRecord.waterDose;
  const newCreatedDate = new Date(createdDate).toISOString();

  const waterDoseShift = oldWaterDose - newWaterDose;

  toDayWaterData = await Water.findOneAndUpdate(
    { "waterNotes._id": id },
    {
      $inc: { waterTotal: -waterDoseShift },
      $set: {
        persantRate: Math.round(
          ((waterTotal - waterDoseShift) / userDailyNorma) * 100
        ),
        "waterNotes.$.waterDose": newWaterDose,
        "waterNotes.$.createdDate": newCreatedDate,
      },
    },

    { new: true }
  );
  waterRecord = toDayWaterData.waterNotes.find((option) => option.id === id);

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
  if (!rawData) {
    throw HttpError(404, "Not Found");
  }

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

const dailyNorm = async (req, res) => {
  const { _id: owner } = req.user;
  const { dailyNorma: newDailyNorma } = req.body;
  if (!newDailyNorma) {
    throw HttpError(400, "Daily norma has no value!");
  }

  const actualDate = new Date().toISOString().substring(0, 10);

  const toDayWaterData = await Water.findOne({ owner, date: actualDate });
  if (!toDayWaterData) {
    throw HttpError(404, "Not Found");
  }
  const { waterTotal } = toDayWaterData;

  if (!toDayWaterData) {
    const result = await Water.create({
      owner,
      date: actualDate,
      waterTotal: 0,
      persantRate: 0,
      dailyNorma: newDailyNorma,
      waterSavings: 0,
      waterNotes: [],
    });

    return res.status(201).json(result);
  } else {
    const waterRate = Math.round((waterTotal / newDailyNorma) * 100);
    const result = await Water.findOneAndUpdate(
      { owner, date: actualDate },
      {
        $set: {
          dailyNorma: newDailyNorma,
          persantRate: waterRate,
        },
      },
      { new: true }
    );
    if (!result) {
      throw HttpError(404, "Not Found");
    }

    return res.json(result);
  }
};

export default {
  addWater: ctrlWrapper(addWater),
  today: ctrlWrapper(today),
  deleteWaterRecord: ctrlWrapper(deleteWaterRecord),
  updateWaterDose: ctrlWrapper(updateWaterDose),
  month: ctrlWrapper(month),
  dailyNorm: ctrlWrapper(dailyNorm),
};
