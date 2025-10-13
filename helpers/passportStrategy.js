import dotenv from "dotenv";
// import OAuth2Strategy from "passport-oauth2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
dotenv.config();
const { GOOGLE_CLIENTID, GOOGLE_SECRET, CALLBACK_URL } = process.env;

passport.use( new GoogleStrategy({
    clientID: GOOGLE_CLIENTID,
    clientSecret: GOOGLE_SECRET,
    callbackURL: `${CALLBACK_URL}/auth/google/callback`,
    scope:['profile','email', 'openid'],
    acesstype: 'offline'

  },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ exampleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
(accessToken, refreshToken, profile, done) => {
    console.log("accessToken", accessToken);
    console.log("profile", profile);
   
      // Here you can save/find user in DB if needed
      return done(null, profile);}
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));