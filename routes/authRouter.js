import express from "express";
import authControllers from "../controllers/authController.js";
import validateBody from "../helpers/validateBody.js";
import { authenticate } from "../middlewares/authenticate.js";
import { registerSchema, loginSchema } from "../models/user.js";
import passport from "passport";
import "../helpers/passportStrategy.js";

const {CALLBACK_URL} = process.env;
const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authControllers.register
);

authRouter.post("/login", validateBody(loginSchema), authControllers.login);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.logout);

authRouter.get("/google", passport.authenticate('google',
  // { scope: ['profile', 'email', 'openid'] }
));

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "http://localhost:3000",
  })
);

export default authRouter;
