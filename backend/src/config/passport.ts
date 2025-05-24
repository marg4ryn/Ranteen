import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Local Strategy for Admin Login
passport.use(
  'admin-local', // Named strategy for admin
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email, role: 'admin' }).select('+password');
        if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        if (!user.password) { // Should not happen if role is admin and password was set
          return done(null, false, { message: 'Admin account not properly configured.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy for Student Login
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

if (!googleClientID || !googleClientSecret || !googleCallbackURL) {
  console.error('Google OAuth environment variables not set!');
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any, info?: any) => void) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          // If user exists but is not approved, they still log in but functionality is limited
          return done(null, user);
        }
        // If new student, create account, default isApproved is false
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          name: profile.displayName,
          profilePictureUrl: profile.photos?.[0].value,
          role: 'student',
          isApproved: false, // New students require admin approval
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user: determines which data of the user object should be stored in the session
passport.serializeUser((user: any, done) => { // user can be IUser
  done(null, user.id);
});

// Deserialize user: retrieves user data from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;