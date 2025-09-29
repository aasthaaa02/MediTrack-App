const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Animal = require('../models/animal');
const Treatment = require('../models/treatment');
const Bill = require('../models/bill');

// GET /api/farmer/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try{
    const totalAnimals = await Animal.countDocuments({ owner: req.user._id });
    const activeRequests = await Treatment.countDocuments({ farmer: req.user._id, status: 'Active' });
    const pendingBills = await Bill.countDocuments({ farmer: req.user._id, status: 'Pending' });
    const completedTreatments = await Treatment.countDocuments({ farmer: req.user._id, status: 'Completed' });

    const recentRequests = await Treatment.find({ farmer: req.user._id })
      .populate('animal', 'animalId type')
      .sort({ createdAt: -1 })
      .limit(5);

    // format recent for frontend
    const recentFormatted = recentRequests.map(r => ({
      requestId: r.requestId,
      animalId: r.animal?.animalId || '',
      symptoms: r.symptoms,
      status: r.status,
      date: r.createdAt
    }));

    return res.json({
      totalAnimals, activeRequests, pendingBills, completedTreatments,
      recentRequests: recentFormatted
    });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
