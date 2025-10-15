import ctrlWrapper from "../decorators/ctrlWrapper.js";
import authService from "../services/authService.js";
const REDIRECT_URL = process.env.REDIRECT_URL || "http://localhost:3000";

const googleAuth = async (req, res) => {
  const profile = req.user;
  if (!profile) {
    throw HttpError(401, "Not authorized");
  }
  const { token } = await authService.handleGoogleUser(profile);
  if (!token) {
    throw HttpError(401, "Not authorized");
  }

  res.redirect(`${REDIRECT_URL}/signup/?token=${token}`);
};

const register = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.registerUser(email, password, req.body);
  res.status(201).json(result);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(result.token);
};

const getCurrent = async (req, res) => {
  const { _id, email, token, userName, avatarURL, gender, dailyNorma } =
    req.user;
  res.json({ _id, email, token, userName, avatarURL, gender, dailyNorma });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await authService.logoutUser(_id);
  res.json({ message: "Logout success" });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw HttpError(401, "Not authorized");
  }
  const refreshedUser = await authService.tokenRefresh(refreshToken);

  res.cookie("refreshToken", refreshedUser.refreshToken, {
    httpOnly: true,
    secure: false,
    path: "/",
  });

  res.status(200).json({
    // user: refreshedUser.user,
    accessToken: refreshedUser.accessToken,
  });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  googleAuth: ctrlWrapper(googleAuth),
  refreshToken: ctrlWrapper(refreshToken),
};
