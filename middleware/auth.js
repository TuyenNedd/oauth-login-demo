module.exports = {
  // Ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/auth/login');
  },
  
  // Ensure user is not authenticated (for login/register pages)
  ensureGuest: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');
  },
  
  // Ensure user has GitHub OAuth token
  ensureGithubAuth: function(req, res, next) {
    if (req.user.githubId && req.session.githubToken) {
      return next();
    }
    req.flash('error_msg', 'Please connect your GitHub account first');
    res.redirect('/dashboard');
  }
};
