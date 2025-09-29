const express = require('express');
const router = express.Router();
const Prescription = require('../models/prescription');
const Bill = require('../models/bill');
const authMiddleware = require('../middleware/authMiddleware');

// Pharmacist Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const pharmacistId = req.user._id;

        const pendingPrescriptions = await Prescription.countDocuments({ status: 'Pending' });
        const billsGenerated = await Bill.countDocuments({ pharmacistId });
        const prescriptionsFulfilled = await Prescription.countDocuments({ status: 'Fulfilled' });

        res.json({ pendingPrescriptions, billsGenerated, prescriptionsFulfilled });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// View prescriptions
router.get('/view-prescriptions', authMiddleware, async (req, res) => {
    try {
        const prescriptions = await Prescription.find().populate('requestId');
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark prescription as fulfilled
router.post('/prescriptions/:id/fulfill', authMiddleware, async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

        prescription.status = 'Fulfilled';
        await prescription.save();
        res.json({ message: 'Prescription marked as fulfilled', prescription });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Generate bill
router.post('/generate-bill', authMiddleware, async (req, res) => {
    try {
        const { prescriptionId, totalAmount } = req.body;
        const pharmacistId = req.user._id;

        const bill = new Bill({ prescriptionId, pharmacistId, totalAmount });
        await bill.save();

        // Update prescription status as fulfilled if not already
        const prescription = await Prescription.findById(prescriptionId);
        if (prescription) {
            prescription.status = 'Fulfilled';
            await prescription.save();
        }

        res.status(201).json({ message: 'Bill generated', bill });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
