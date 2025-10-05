const express = require('express');
const router = express.Router();
const Treatment = require('../models/treatment');
const User = require('../models/user');

// Government Dashboard - AMU usage area wise
router.get('/dashboard', async (req, res) => {
  try {
    const report = await Treatment.aggregate([
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
          _id: '$farmerDetails.area', // Group by farmer's area
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { usageCount: -1 } } // Sort by highest usage
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//High AMU Areas
router.get('/high-amu-areas', async (req, res) => {
  try {
    const result = await Treatment.aggregate([
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
          _id: '$farmerDetails.area',
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { usageCount: -1 } }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List professionals in a specific area (for High AMU Area details)
router.get('/high-amu-areas/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const professionals = await User.find({
      area,
      role: { $in: ['vet', 'pharmacist'] }
    }, 'name phone role');

    res.json(professionals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Send alert to professionals in selected areas
router.post('/high-amu-areas/:area/alert', async (req, res) => {
  try {
    const { area } = req.params;
    const professionals = await User.find(
      { area, role: { $in: ['vet', 'pharmacist'] } },
      'name phone email role'
    );

    if (!professionals.length) {
      return res.status(404).json({ message: 'No professionals found in this area' });
    }

    //Mock Alert Service (replace with SMS/Email later)
    professionals.forEach((pro) => {
      console.log(`[ALERT] Sent alert to ${pro.role} ${pro.name} (${pro.phone}) in ${area}`);
    });

    res.json({ message: `Alert sent to ${professionals.length} professionals in ${area}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Low AMU Areas
router.get('/low-amu-areas', async (req, res) => {
  try {
    const result = await Treatment.aggregate([
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
          _id: '$farmerDetails.area',
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { usageCount: 1 } } // ascending = low usage first
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List professionals in a specific area (Low AMU Area details)
router.get('/low-amu-areas/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const professionals = await User.find(
      { area, role: { $in: ['vet', 'pharmacist'] } },
      'name phone role'
    );

    res.json(professionals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compare Medicines Usage
router.get('/compare-medicines', async (req, res) => {
  try {
    const { meds, from, to } = req.query; 
    // meds should be a comma-separated list of medicine names
    if (!meds) return res.status(400).json({ error: "Please provide medicines to compare" });

    const medicines = meds.split(',').map(m => m.trim());
    const query = { medicine: { $in: medicines } };

    if (from && to) {
      query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    const comparison = await Treatment.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$medicine",
          usageCount: { $sum: 1 },
          areas: { $addToSet: "$area" } // assuming Treatment has area field or via join
        }
      }
    ]);

    res.json(comparison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
