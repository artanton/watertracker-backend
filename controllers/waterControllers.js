import ctrlWrapper from "../decorators/ctrlWrapper.js";
import * as waterService from "../services/waterService.js";

const addWater = async (req, res) => {
  const { _id: owner, dailyNorma } = req.user;
  const { date, waterDose } = req.body;
  const result = await waterService.addWaterService(owner, dailyNorma, date, waterDose);
  res.status(201).json(result);
};

const today = async (req, res) => {
  const { _id: owner, dailyNorma } = req.user;
  const { date } = req.query;
  const result = await waterService.getTodayWaterService(owner, dailyNorma, date);
  res.status(200).json(result);
};

const deleteWaterRecord = async (req, res) => {
  const { _id: owner, dailyNorma } = req.user;
  const { id } = req.params;
  const result = await waterService.deleteWaterRecordService(owner, id, dailyNorma);
  res.status(200).json(result);
};

const updateWaterDose = async (req, res) => {
  const { _id: owner, dailyNorma } = req.user;
  const { id } = req.params;
  const { waterDose, createdDate } = req.body;
  const result = await waterService.updateWaterDoseService(owner, id, dailyNorma, waterDose, createdDate);
  res.status(200).json(result);
};

const month = async (req, res) => {
  const { _id: owner } = req.user;
  const { date } = req.query;
  const result = await waterService.getMonthWaterService(owner, date);
  res.status(200).json(result);
};

const dailyNorm = async (req, res) => {
  const { _id: owner } = req.user;
  const { dailyNorma } = req.body;
  const result = await waterService.updateDailyNormService(owner, dailyNorma);
  res.status(200).json(result);
};

export default {
  addWater: ctrlWrapper(addWater),
  today: ctrlWrapper(today),
  deleteWaterRecord: ctrlWrapper(deleteWaterRecord),
  updateWaterDose: ctrlWrapper(updateWaterDose),
  month: ctrlWrapper(month),
  dailyNorm: ctrlWrapper(dailyNorm),
};
