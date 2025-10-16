// services/authService.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.js";
import HttpError from "../helpers/HttpError.js";

dotenv.config();
const { SECRET_KEY } = process.env;

// const generateTokens = async (payload) => {
//   const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "300s" });
//   const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
//     expiresIn: "7d",
//   });
//   const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
//   return { accessToken, refreshToken, hashRefreshToken };
// };

// const updateUser = (filter, data) =>
//   User.findOneAndUpdate(filter, { ...data }, { new: true });

// export const tokenRefresh = async (token) => {
//   try {
//     const {id}= jwt.verify(token, JWT_REFRESH_SECRET);
//   // const payload = jwt.decode(token);

//   const userToUpdate = await User.findOne({ _id:id });
//   if(!userToUpdate){
//     throw new HttpError(401, "Not authorized");
//   };

//   const storedToken = userToUpdate.refreshToken;

//   if (!storedToken) {
//     throw  HttpError(401, "Not authorized");
//   }
//   const compareRefreshTokens = await bcrypt.compare(token, storedToken);

//   if (!compareRefreshTokens) {
//     throw HttpError(401, "Not authorized");
//   }

//   const refreshedTokens = await generateTokens({ id: userToUpdate.id });

//   const updatedUser = await updateUser(
//     { _id: id },
//     { refreshToken: refreshedTokens.hashRefreshToken }
//   );

//   return {
//     user: {
//       email: updatedUser.email,
//       name: updatedUser.name,
//       avatarURL: updatedUser.avatarURL,
//       verify: updatedUser.verify,
//     },
//     accessToken: refreshedTokens.accessToken,
//     refreshToken: refreshedTokens.refreshToken,
//   };

//   } catch (error) {
//    throw HttpError(401,error.message);
//   }

// };

const handleGoogleUser = async (profile) => {
  const email = profile.emails[0].value;
  const hashPassword = await bcrypt.hash(profile.id, 10);

  let user = await User.findOne({ email });

  try {
    if (!user) {
      user = await User.create({
        email,
        userName: profile.displayName,
        password: hashPassword,
        avatarURL: profile.photos[0].value,
      });
    }
  } catch (err) {
    if (err.code === 11000) {
      user = await User.findOne({ email }); // already created by another request
    } else {
      throw err;
    }
  }

  const payload = { id: user._id.toString() };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  return { token };
};

const registerUser = async (email, password, body) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw HttpError(409, "Email already in use");

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...body,
    password: hashPassword,
  });

  const payload = { id: newUser._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(newUser._id, { token });

  return {
    email: newUser.email,
    name: newUser.name,
    token,
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw HttpError(401, "Email or password invalid");

  const isPasswordValid = bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw HttpError(401, "Email or password invalid");

  const payload = { id: user._id.toString() };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  const updatedUser = await User.findByIdAndUpdate(user._id, { token });
  console.log( updatedUser);
  // const tokens = await generateTokens(payload);
  //   await User.findByIdAndUpdate(user._id, { token: tokens.accessToken, refreshToken: tokens.hashRefreshToken });

  return { token };
};

const logoutUser = async (id) => {
  await User.findByIdAndUpdate(id, { token: "" });
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  handleGoogleUser,
  // tokenRefresh
};
