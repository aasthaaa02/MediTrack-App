const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');
const User = require('../models/user');
const Batch = require('../models/batch');
const Treatment = require('../models/treatment');
const jwt = require('jsonwebtoken');

// Generate OTP
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = await otpService.generateOtp(email);
    res.json({ message: 'OTP sent to email', otp }); // otp will be emailed in real app
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP & issue token
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await otpService.verifyOtp(email, otp);
    if (!isValid) return res.status(400).json({ error: 'Invalid OTP' });

    // Create customer if not exists
    let user = await User.findOne({ email, role: 'Customer' });
    if (!user) {
      user = new User({ email, role: 'Customer' });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Area-wise AMU Report
router.get('/amu-report', async (req, res) => {
  try {
    const { from, to } = req.query; // custom range
    const query = {};

    //handle period (1m, 3m, 6m, 1y)
    if (period) {
      const now = new Date();
      let start;
      switch (period) {
        case '1m': start = new Date(now.setMonth(now.getMonth() - 1)); break;
        case '3m': start = new Date(now.setMonth(now.getMonth() - 3)); break;
        case '6m': start = new Date(now.setMonth(now.getMonth() - 6)); break;
        case '1y': start = new Date(now.setFullYear(now.getFullYear() - 1)); break;
        default: start = null;
      }
      if (start) query.createdAt = { $gte: start };
    }
    
    //handle custom range
    if (from && to) {
      query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    const report = await Treatment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'animals',
          localField: 'animal',
          foreignField: '_id',
          as: 'animalDetails'
        }
      },
      { $unwind: '$animalDetails' },
      {
        $lookup: {
          from: 'users',
          localField: 'animalDetails.farmer',
          foreignField: '_id',
          as: 'farmerDetails'
        }
      },
      { $unwind: '$farmerDetails' },
      {
        $group: {
          _id: '$farmerDetails.area', // group by area
          usageCount: { $sum: 1 }
        }
      }
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Product Info (barcode or batchId)
router.get('/product/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const product = await Batch.findOne({ batchId }).populate('farmer');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
