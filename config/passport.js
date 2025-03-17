const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (username/password)
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      // If user not found
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // If user has no password (OAuth only user)
      if (!user.password) {
        return done(null, false, { 
          message: 'This account was created with a social login. Please use that method to sign in.' 
        });
      }
      
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Success
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }
        
        // Check if user exists with same email
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.avatar = existingUser.avatar || profile.photos[0].value;
          await existingUser.save();
          return done(null, existingUser);
        }
        
        // Create new user
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName.replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
          displayName: profile.displayName,
          avatar: profile.photos[0].value
        });
        
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'repo']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Store GitHub access token for later API use
        profile.accessToken = accessToken;
        
        // Check if user already exists
        let user = await User.findOne({ githubId: profile.id });
        
        if (user) {
          // Update access token in session (we'll handle this later)
          return done(null, { ...user.toObject(), githubToken: accessToken });
        }
        
        // Get email from GitHub profile
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        // Check if user exists with same email
        if (email) {
          const existingUser = await User.findOne({ email });
          
          if (existingUser) {
            // Link GitHub account to existing user
            existingUser.githubId = profile.id;
            existingUser.avatar = existingUser.avatar || profile.photos[0].value;
            await existingUser.save();
            return done(null, { ...existingUser.toObject(), githubToken: accessToken });
          }
        }
        
        // Create new user
        user = new User({
          githubId: profile.id,
          email: email || `${profile.username}@github.com`,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          avatar: profile.photos[0].value
        });
        
        await user.save();
        return done(null, { ...user.toObject(), githubToken: accessToken });
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
