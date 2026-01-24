const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

router.get('/google', (req, res, next) => {
  if (!hasGoogleCredentials) {
    return res.status(503).json({ error: 'Google OAuth not configured' });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!hasGoogleCredentials) {
    return res.redirect('/?error=auth_not_configured');
  }
  passport.authenticate('google', {
    failureRedirect: '/?error=auth_failed',
    session: true
  })(req, res, next);
}, (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // In production, redirect to root (same origin). In dev, redirect to client URL
    const redirectUrl = process.env.NODE_ENV === 'production' ? '/' : (process.env.CLIENT_URL || 'http://localhost:3000');
    res.redirect(redirectUrl);
  }
);

router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        firstName: req.user.firstName,
        profilePicture: req.user.profilePicture,
        preferences: req.user.preferences
      }
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('token');
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
