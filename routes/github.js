const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ensureAuthenticated, ensureGithubAuth } = require('../middleware/auth');

// @route   GET /github/repos
// @desc    List user's GitHub repositories
// @access  Private + GitHub Auth
router.get('/repos', ensureAuthenticated, ensureGithubAuth, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${req.session.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    res.render('github-repos', {
      title: 'My GitHub Repositories',
      user: req.user,
      repos: response.data
    });
  } catch (error) {
    console.error('Error fetching GitHub repos:', error.response?.data || error.message);
    req.flash('error_msg', 'Failed to fetch GitHub repositories');
    res.redirect('/dashboard');
  }
});

// @route   GET /github/create
// @desc    Show create repository form
// @access  Private + GitHub Auth
router.get('/create', ensureAuthenticated, ensureGithubAuth, (req, res) => {
  res.render('github-create', {
    title: 'Create GitHub Repository',
    user: req.user
  });
});

// @route   POST /github/create
// @desc    Create a new GitHub repository
// @access  Private + GitHub Auth
router.post('/create', ensureAuthenticated, ensureGithubAuth, async (req, res) => {
  try {
    const { name, description, isPrivate, readme } = req.body;
    
    // Create repository
    const response = await axios.post(
      'https://api.github.com/user/repos',
      {
        name,
        description,
        private: isPrivate === 'on',
        auto_init: readme === 'on'
      },
      {
        headers: {
          'Authorization': `token ${req.session.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    req.flash('success_msg', `Repository ${name} created successfully`);
    res.redirect('/github/repos');
  } catch (error) {
    console.error('Error creating GitHub repo:', error.response?.data || error.message);
    req.flash('error_msg', `Failed to create repository: ${error.response?.data?.message || error.message}`);
    res.redirect('/github/create');
  }
});

// @route   POST /github/upload
// @desc    Upload files to a GitHub repository
// @access  Private + GitHub Auth
router.post('/upload', ensureAuthenticated, ensureGithubAuth, async (req, res) => {
  try {
    const { repoName, filePath, fileContent, commitMessage } = req.body;
    
    // Convert content to base64
    const contentEncoded = Buffer.from(fileContent).toString('base64');
    
    // Create or update file
    await axios.put(
      `https://api.github.com/repos/${req.user.username}/${repoName}/contents/${filePath}`,
      {
        message: commitMessage || `Add ${filePath}`,
        content: contentEncoded
      },
      {
        headers: {
          'Authorization': `token ${req.session.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    req.flash('success_msg', `File ${filePath} uploaded successfully`);
    res.redirect(`/github/repo/${repoName}`);
  } catch (error) {
    console.error('Error uploading to GitHub:', error.response?.data || error.message);
    req.flash('error_msg', `Failed to upload file: ${error.response?.data?.message || error.message}`);
    res.redirect('/github/repos');
  }
});

// @route   GET /github/repo/:repo
// @desc    View a specific repository
// @access  Private + GitHub Auth
router.get('/repo/:repo', ensureAuthenticated, ensureGithubAuth, async (req, res) => {
  try {
    // Get repository details
    const repoResponse = await axios.get(
      `https://api.github.com/repos/${req.user.username}/${req.params.repo}`,
      {
        headers: {
          'Authorization': `token ${req.session.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    // Get repository contents (root directory)
    const contentsResponse = await axios.get(
      `https://api.github.com/repos/${req.user.username}/${req.params.repo}/contents`,
      {
        headers: {
          'Authorization': `token ${req.session.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    res.render('github-repo-detail', {
      title: req.params.repo,
      user: req.user,
      repo: repoResponse.data,
      contents: contentsResponse.data
    });
  } catch (error) {
    console.error('Error fetching repo details:', error.response?.data || error.message);
    req.flash('error_msg', 'Failed to fetch repository details');
    res.redirect('/github/repos');
  }
});

module.exports = router;
