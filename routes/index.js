const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// @route   GET /
// @desc    Home page
// @access  Public
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Welcome',
    user: req.user
  });
});

// @route   GET /dashboard
// @desc    Dashboard page
// @access  Private
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user,
    githubConnected: !!req.user.githubId,
    githubToken: req.session.githubToken
  });
});

module.exports = router;
