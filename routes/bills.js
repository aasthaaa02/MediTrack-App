const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Bill = require('../models/bill');
const Animal = require('../models/animal');
const { billId } = require('../utils/idGenerator');

// For prototype we provide endpoints to create & list bills (in real app pharmacist creates)
router.post('/', auth, async (req, res) => {
  try{
    // expects: prescriptionId (treatment.requestId), animalId, totalAmount
    const { prescriptionId, animalId, totalAmount } = req.body;
    if(!prescriptionId || !animalId || !totalAmount) return res.status(400).json({ error: 'prescriptionId, animalId, totalAmount required' });

    // ensure animal belongs to user
    const animal = await Animal.findOne({ animalId });
    if(!animal) return res.status(404).json({ error: 'animal not found' });

    const bId = billId();
    const bill = await Bill.create({
      billId: bId,
      prescriptionId,
      farmer: animal.owner,
      animal: animal._id,
      totalAmount: Number(totalAmount),
      status: 'Pending'
    });

    return res.json({ ok: true, bill });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

// list bills for logged in farmer
router.get('/', auth, async (req, res) => {
  try{
    const bills = await Bill.find({ farmer: req.user._id })
      .populate('animal', 'animalId type')
      .sort({ createdAt: -1 });
    return res.json({ ok: true, bills });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
});

// mark bill paid
router.post('/:billId/pay', auth, async (req, res) => {
  try{
    const { billId } = req.params;
    const bill = await Bill.findOne({ billId, farmer: req.user._id });
    if(!bill) return res.status(404).json({ error: 'Bill not found' });
    bill.status = 'Paid';
    await bill.save();
    return res.json({ ok: true, bill });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
