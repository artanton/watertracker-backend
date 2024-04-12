import express from "express";
import authControllers from "../controllers/authController.js";
import validateBody from "../helpers/validateBody.js";
import { authenticate } from "../middlewares/authenticate.js";
import { registerSchema, loginSchema, avatarSchema } from "../models/user.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authControllers.register
);

authRouter.post("/login", validateBody(loginSchema), authControllers.login);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.logout);

authRouter.post(
  "/",
  authenticate,
  upload.single("avatar"),
  validateBody(avatarSchema),
  authControllers.addAvatar
);

export default authRouter;
