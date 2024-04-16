import bcrypt from "bcrypt";

import { User } from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const updateUserSettings = async (req, res) => {
  const { _id } = req.user;
  const { email, userName, gender, dailyNorm, oldPassword, newPassword } =
    req.body;
  const newData = {};
  userName && (newData.userName = userName);
  gender && (newData.gender = gender);
  dailyNorm && (newData.dailyNorm = dailyNorm);
  req.file?.path && (newData.avatarURL = req.file.path);
  if (email) {
    const isTakenEmail = await User.findOne({ email });
    if (isTakenEmail && email !== req.user.email) {
      throw HttpError(409, "Email is already in use");
    }
    newData.email = email;
  }

  if (oldPassword && newPassword) {
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    newData.password = newHashPassword;
  }

  const result = await User.findByIdAndUpdate(
    _id,
    { ...newData },
    { new: true }
  );
  res.status(200).json(result);
};

export default { updateUserSettings: ctrlWrapper(updateUserSettings) };
