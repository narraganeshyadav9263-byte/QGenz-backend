const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); 

// Debug: Log Google OAuth configuration
console.log('Google OAuth Configuration:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5010/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile.emails || !profile.emails[0]) {
      return done(new Error('No email provided by Google'), null);
    }

    const email = profile.emails[0].value;
    console.log('Processing Google login for email:', email);

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: email,
        password: 'google-oauth' // Optional placeholder
      });
      console.log('✅ New user created from Google:', user);
    } else {
      console.log('🔁 Existing Google user logged in:', user);
    }

    return done(null, user);
  } catch (err) {
    console.error('❌ Error in Google strategy:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
