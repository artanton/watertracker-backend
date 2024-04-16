import bcrypt from "bcrypt";

import { User } from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const updateUserSettings = async (req, res) => {
  const { _id } = req.user;
  const { email, userName, gender, dailyNorma, oldPassword, newPassword } =
    req.body;
  const newData = {};
  userName && (newData.userName = userName);
  gender && (newData.gender = gender);
  dailyNorma && (newData.dailyNorma = dailyNorma);
  req.file?.path && (newData.avatarURL = req.file.path);
  if (email) {
    const isTakenEmail = await User.findOne({ email });
    if (isTakenEmail) {
      throw HttpError(409, "Email already in use");
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
