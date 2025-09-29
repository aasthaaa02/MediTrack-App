const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Treatment = require('../models/treatment');
const Animal = require('../models/animal');
const { requestId } = require('../utils/idGenerator');

// create treatment request (farmer)
router.post('/', auth, async (req, res) => {
  try{
    const { animalId, symptoms } = req.body;
    if(!animalId || !symptoms) return res.status(400).json({ error: 'animalId & symptoms required' });

    // find animal owned by farmer
    const animal = await Animal.findOne({ animalId, owner: req.user._id });
    if(!animal) return res.status(404).json({ error: 'Animal not found or not owned by you' });

    const rId = requestId();
    const tr = await Treatment.create({
      requestId: rId,
      farmer: req.user._id,
      animal: animal._id,
      symptoms,
      status: 'Pending'
    });

    return res.json({ ok: true, treatment: tr });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// list previous treatment requests for logged in farmer
router.get('/', auth, async (req, res) => {
  try{
    const list = await Treatment.find({ farmer: req.user._id })
      .populate('animal', 'animalId type')
      .sort({ createdAt: -1 });
    return res.json({ ok: true, list });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
