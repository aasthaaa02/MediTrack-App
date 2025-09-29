const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendOtp, verifyOtp } = require('../services/otpService');

router.post('/send-otp', async (req, res) => {
  try{
    const { phone } = req.body;
    if(!phone) return res.status(400).json({ error: 'phone required' });
    sendOtp(phone); // mock - logs OTP to console
    return res.json({ ok: true, message: 'OTP sent (mock)' });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try{
    const { phone, otp, role } = req.body;
    if(!phone || !otp) return res.status(400).json({ error: 'phone & otp required' });

    const ok = verifyOtp(phone, otp);
    if(!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // find or create user
    let user = await User.findOne({ phone });
    if(!user){
      user = await User.create({ phone, role: role || 'farmer' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return res.json({ ok: true, token, role: user.role, userId: user._id });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
