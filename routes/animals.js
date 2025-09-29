const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const Animal = require('../models/animal');
const { shortId } = require('../utils/idGenerator');

// storage config
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function(req, file, cb){
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// add animal (authenticated)
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try{
    const { type, weightKg, description } = req.body;
    if(!type) return res.status(400).json({ error: 'Animal type required' });

    // generate animal id e.g., A-XXXXX
    const animalId = shortId('A',5); // e.g., A-1AB2C

    const animal = await Animal.create({
      animalId,
      owner: req.user._id,
      type,
      weightKg: weightKg ? Number(weightKg) : undefined,
      description,
      photo: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    return res.json({ ok: true, animal });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// list animals for logged in farmer
router.get('/', auth, async (req, res) => {
  try{
    const animals = await Animal.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({ ok: true, animals });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
