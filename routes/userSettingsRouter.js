import express from "express";
import validateBody from "../helpers/validateBody.js";
import { authenticate } from "../middlewares/authenticate.js";
import { userSettingsSchema } from "../schemas/userSchemas.js";
import userSettingsController from "../controllers/userSettingsController.js";
import upload from "../middlewares/upload.js";

const userSettingsRouter = express.Router();

userSettingsRouter.get(
  "/",
  authenticate,
  validateBody(userSettingsSchema),
  userSettingsController.getUserSettings
);

userSettingsRouter.patch(
  "/",
  authenticate,
  upload.single("avatarURL"),
  validateBody(userSettingsSchema),
  userSettingsController.updateUserSettings
);

export default userSettingsRouter;
