import bcrypt from "bcrypt";

import { User } from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const updateUserSettings = async (req, res) => {
  const { _id } = req.user;
  const { email, userName, gender, dailyNorm, oldPassword, newPassword } =
    req.body;
  if (oldPassword & newPassword & (oldPassword === newPassword)) {
    throw HttpError(400, "New password cannot be the same as old password");
  }
  const newData = {};
  if (email !== undefined) {
    if (email === req.user.email) {
      throw HttpError(400, "New email cannot be the same as old email");
    }
    const isTakenEmail = await User.findOne({ email });
    if (isTakenEmail) {
      throw HttpError(409, "Email already in use");
    }
    newData.email = email;
  }
  if (userName !== undefined) {
    newData.userName = userName;
  }
  if (gender !== undefined) {
    newData.gender = gender;
  }
  if (dailyNorm !== undefined) {
    newData.dailyNorm = dailyNorm;
  }
  if (req.file && req.file.path) {
    newData.avatarURL = req.file.path;
  }
  if (oldPassword & newPassword) {
    const passwordCompare = await bcrypt.compare(
      oldPassword,
      req.user.password
    );
    if (!passwordCompare) {
      throw HttpError(400, "Old password is wrong");
    }
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
