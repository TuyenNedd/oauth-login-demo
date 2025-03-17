# OAuth Login Demo

A complete authentication system with username/password, Google OAuth, and GitHub OAuth that allows users to create and manage GitHub repositories.

## Features

- 🔐 Local username/password authentication
- 🔑 Google OAuth login
- 🔄 GitHub OAuth integration
- 📁 GitHub repository management
- 📤 Code upload to GitHub

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials (from Google Cloud Console)
- GitHub OAuth App credentials

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YourUsername/oauth-login-demo.git
   cd oauth-login-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (use `.env.example` as a template):
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/oauth-login-demo
   SESSION_SECRET=your_session_secret_here
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Setting Up OAuth Credentials

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth client ID (Web application)
5. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the Authorization callback URL to: `http://localhost:3000/auth/github/callback`
4. Generate a client secret
5. Copy the Client ID and Client Secret to your `.env` file

## Usage

1. Register a new account or login with Google/GitHub
2. Connect your GitHub account if you haven't logged in with GitHub
3. Create new repositories or manage existing ones
4. Upload code to your repositories

## Project Structure

```
oauth-login-demo/
├── config/             # Configuration files
├── middleware/         # Custom middleware
├── models/             # Database models
├── public/             # Static assets
├── routes/             # Route handlers
├── views/              # EJS templates
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── app.js              # Main application file
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## License

MIT
