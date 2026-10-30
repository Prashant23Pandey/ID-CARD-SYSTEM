const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, STATUS, ROLES } = require('../models/User');
const logger = require('../utils/logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/v1/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const profilePhoto = profile.photos[0]?.value;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // If user exists but doesn't have googleId linked, link it
          if (!user.googleId) {
            user.googleId = googleId;
            if (!user.profilePhoto) user.profilePhoto = profilePhoto;
            user.emailVerified = true; // Google emails are implicitly verified
            await user.save();
          }
          return done(null, user);
        }

        // If user doesn't exist, create a new one
        // Note: New Google users are created as TEACHER by default, lacking a schoolId.
        // In a real flow, you might redirect them to complete their profile (add schoolId/role).
        user = await User.create({
          username: email.split('@')[0] + Math.floor(Math.random() * 1000), // Generate random username
          name,
          email,
          googleId,
          profilePhoto,
          role: ROLES.TEACHER, // Default role
          status: STATUS.ACTIVE,
          emailVerified: true,
          mobile: '0000000000', // Dummy mobile as Google doesn't provide it
        });

        logger.info(`New user registered via Google OAuth: ${email}`);
        return done(null, user);
      } catch (error) {
        logger.error(`Google OAuth Error: ${error.message}`);
        return done(error, false);
      }
    }
  )
);

// Serialize/Deserialize not strictly needed since we are using JWT, 
// but required by passport to not throw errors.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
