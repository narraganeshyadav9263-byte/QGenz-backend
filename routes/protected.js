const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // assuming you use JWT
const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // ✅ User is authenticated
    const user = req.user;

    // Generate a JWT token (or use session if you prefer that)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // ✅ Redirect to frontend with user info
    res.redirect(
      `${FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${user.email}&id=${user._id}`
    );
  }
);

module.exports = router;
