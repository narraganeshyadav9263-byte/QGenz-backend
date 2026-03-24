const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // assuming you use JWT
const router = express.Router();

// Google OAuth login route
router.get('/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback',
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    passport.authenticate('google', { 
      failureRedirect: `${frontendUrl}/login?error=Authentication failed`,
      session: false 
    })(req, res, next);
  },
  (req, res) => {
    try {
      if (!req.user) {
        throw new Error('No user data received from Google');
      }

      const user = req.user;
      
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${user.email}&id=${user._id}`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=Authentication failed`);
    }
  }
);

module.exports = router;
