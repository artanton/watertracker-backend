import dotenv from "dotenv";
// import OAuth2Strategy from "passport-oauth2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import authControllers from "../controllers/authController.js";
import authService from "../services/authService.js";
dotenv.config();
const { GOOGLE_CLIENTID, GOOGLE_SECRET, CALLBACK_URL } = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENTID,
      clientSecret: GOOGLE_SECRET,
      callbackURL: `${CALLBACK_URL}/api/auth/google/callback`,
      scope: ["profile", "email", "openid"],
      acesstype: "offline",
    },

    async (accessToken, refreshToken, profile, done) => {
      authService.handleGoogleUser(profile);
      // Here you can save/find user in DB if needed
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
