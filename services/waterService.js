import { Water } from "../models/water.js";
import { User } from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import { getDaysOfMonth } from "../helpers/waterHelper.js";

export const addWaterService = async (owner, userDailyNorma, date, waterDose) => {
  const actualDate = date.toString().substring(0, 10);
  const toDayWaterData = await Water.findOne({ owner, date: actualDate });

  if (!toDayWaterData) {
    const data = { createdDate: date, waterDose };
    const waterRate = Math.round((waterDose / userDailyNorma) * 100);

    return Water.create({
      owner,
      date: actualDate,
      waterTotal: waterDose,
      persantRate: waterRate,
      dailyNorma: userDailyNorma,
      waterSavings: 1,
      waterNotes: [data],
      lastWaterDose: data,
    });
  }

  const { _id: id, waterTotal } = toDayWaterData;

  const updatedData = await Water.findOneAndUpdate(
    { _id: id },
    {
      $push: { waterNotes: { createdDate: date, waterDose } },
      $inc: { waterTotal: +waterDose, waterSavings: 1 },
      $set: {
        persantRate: Math.round(((waterTotal + waterDose) / userDailyNorma) * 100),
      },
    },
    { new: true }
  );

  const result = updatedData.toObject();
  result.lastWaterDose = result.waterNotes[result.waterNotes.length - 1];
  return result;
};

export const getTodayWaterService = async (owner, userDailyNorma, date) => {
  const actualDate = new Date(date).toISOString().substring(0, 10);
  let result = await Water.findOne({ date: actualDate, owner });

  if (!result) {
    result = await Water.create({
      owner,
      date: actualDate,
      waterTotal: 0,
      persantRate: 0,
      dailyNorma: userDailyNorma,
      waterSavings: 0,
      waterNotes: [],
    });
  }

  return result;
};

export const deleteWaterRecordService = async (owner, id, userDailyNorma) => {
  let toDayWaterData = await Water.findOne({ owner, "waterNotes._id": id });
  if (!toDayWaterData) throw HttpError(404, "Not Found");

  const waterRecord = toDayWaterData.waterNotes.find((opt) => opt.id === id);
  const { waterTotal } = toDayWaterData;
  const deletedWaterDose = waterRecord.waterDose;

  toDayWaterData = await Water.findOneAndUpdate(
    { owner, "waterNotes._id": id },
    {
      $inc: { waterTotal: -deletedWaterDose, waterSavings: -1 },
      $pull: { waterNotes: { _id: id } },
      $set: {
        persantRate: Math.round(((waterTotal - deletedWaterDose) / userDailyNorma) * 100),
      },
    },
    { new: true }
  );

  return {
    message: "Delete success",
    id,
    waterTotal: toDayWaterData.waterTotal,
    persantRate: toDayWaterData.persantRate,
    waterSavings: toDayWaterData.waterSavings,
  };
};

export const updateWaterDoseService = async (owner, id, userDailyNorma, newWaterDose, newCreatedDate) => {
  let toDayWaterData = await Water.findOne({ owner, "waterNotes._id": id });
  if (!toDayWaterData) throw HttpError(404, "Not Found");

  const record = toDayWaterData.waterNotes.find((opt) => opt.id === id);
  const { waterTotal } = toDayWaterData;
  const oldWaterDose = record.waterDose;
  const shift = oldWaterDose - newWaterDose;

  toDayWaterData = await Water.findOneAndUpdate(
    { "waterNotes._id": id },
    {
      $inc: { waterTotal: -shift },
      $set: {
        persantRate: Math.round(((waterTotal - shift) / userDailyNorma) * 100),
        "waterNotes.$.waterDose": newWaterDose,
        "waterNotes.$.createdDate": newCreatedDate,
      },
    },
    { new: true }
  );

  const updatedWaterNote = toDayWaterData.waterNotes.find((n) => n.id === id);
  if (!updatedWaterNote) throw HttpError(404, "Updated water note not found");

  return { ...toDayWaterData.toObject(), updatedWaterNote };
};

export const getMonthWaterService = async (owner, date) => {
  const searchedDate = new Date(date);
  const year = searchedDate.getFullYear();
  const monthNo = searchedDate.getMonth();

  const startOfMonth = new Date(Date.UTC(year, monthNo, 0)).toISOString();
  const endOfMonth = new Date(Date.UTC(year, monthNo + 1, 0)).toISOString();

  const rawData = await Water.find({ owner, date: { $gte: startOfMonth, $lte: endOfMonth } });
  if (!rawData) throw HttpError(404, "Not Found");

  const days = getDaysOfMonth(year, monthNo);

  return days.map((day) => {
    const dayData = rawData.find((item) => Number(item.date.toString().slice(8, 10)) === day);
    const formattedDay = day.toString().padStart(2, "0");
    const formattedMonth = `${monthNo + 1}`.toString().padStart(2, "0");
    const date = `${year}-${formattedMonth}-${formattedDay}`;

    return dayData
      ? {
          date: dayData.date,
          dailyNorma: dayData.dailyNorma,
          persantRate: dayData.persantRate,
          waterSavings: dayData.waterSavings,
        }
      : { date, dailyNorma: 0, persantRate: 0, waterSavings: 0 };
  });
};

export const updateDailyNormService = async (owner, newDailyNorma) => {
  const actualDate = new Date().toISOString().substring(0, 10);
  const toDayWaterData = await Water.findOne({ owner, date: actualDate });

  const userDailyNorma = await User.findByIdAndUpdate(
    { _id: owner },
    { $set: { dailyNorma: newDailyNorma } },
    { new: true }
  );

  if (!toDayWaterData) {
    return Water.create({
      owner,
      date: actualDate,
      waterTotal: 0,
      persantRate: 0,
      dailyNorma: newDailyNorma,
      waterSavings: 0,
      waterNotes: [],
    });
  }

  const { waterTotal } = toDayWaterData;
  const waterRate = Math.round((waterTotal / newDailyNorma) * 100);

  return Water.findOneAndUpdate(
    { owner, date: actualDate },
    { $set: { dailyNorma: newDailyNorma, persantRate: waterRate } },
    { new: true }
  );
};
