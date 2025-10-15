import express from "express";
import dotenv from "dotenv";
import authControllers from "../controllers/authController.js";
import validateBody from "../helpers/validateBody.js";
import { authenticate } from "../middlewares/authenticate.js";
import { registerSchema, loginSchema } from "../schemas/userSchemas.js";
import passport from "passport";
import "../helpers/passportStrategy.js";

const {REDIRECT_URL} = process.env;
const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authControllers.register
);

authRouter.post("/login", validateBody(loginSchema), authControllers.login);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.logout);

authRouter.get("/google", passport.authenticate('google'));

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authControllers.googleAuth // ← this will handle token + redirect
);

// authRouter.get(
//   "/refresh",
// authControllers.refreshToken);

export default authRouter;
