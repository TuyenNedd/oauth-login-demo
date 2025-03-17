const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// @route   GET /auth/login
// @desc    Login page
// @access  Public
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    user: req.user
  });
});

// @route   GET /auth/register
// @desc    Register page
// @access  Public
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
    user: req.user
  });
});

// @route   POST /auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, password2 } = req.body;
    let errors = [];

    // Validation
    if (!username || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
      return res.render('register', {
        title: 'Register',
        errors,
        username,
        email,
        user: req.user
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('register', {
        title: 'Register',
        errors,
        username,
        email,
        user: req.user
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password
    });

    await newUser.save();
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server error');
    res.redirect('/auth/register');
  }
});

// @route   POST /auth/login
// @desc    Login user with local strategy
// @access  Public
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// @route   GET /auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// @route   GET /auth/github
// @desc    GitHub OAuth login
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// @route   GET /auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get(
  '/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res) => {
    // Store GitHub token in session for later use with GitHub API
    if (req.user && req.user.githubToken) {
      req.session.githubToken = req.user.githubToken;
    }
    res.redirect('/dashboard');
  }
);

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    req.session.destroy();
    res.redirect('/auth/login');
  });
});

module.exports = router;
