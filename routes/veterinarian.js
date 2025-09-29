const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Prescription = require('../models/prescription');
const authMiddleware = require('../middleware/authMiddleware');

// Dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const veterinarianId = req.user._id;

        const pendingReports = await Request.countDocuments({ status: 'Approved' });
        const prescriptionsCreated = await Prescription.countDocuments({ veterinarianId });
        const casesResolved = await Prescription.distinct('requestId', { veterinarianId }).count;

        res.json({ pendingReports, prescriptionsCreated, casesResolved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// View approved reports
router.get('/view-reports', authMiddleware, async (req, res) => {
    try {
        const approvedRequests = await Request.find({ status: 'Approved' }).populate('animalId');
        res.json(approvedRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// View request details
router.get('/view-reports/:id', authMiddleware, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('animalId farmerId');
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new prescription
router.post('/create-prescription', authMiddleware, async (req, res) => {
    try {
        const { requestId, diagnosis, medication, instruction } = req.body;
        const veterinarianId = req.user._id;

        const newPrescription = new Prescription({
            requestId,
            veterinarianId,
            diagnosis,
            medication,
            instruction
        });

        await newPrescription.save();
        res.status(201).json({ message: 'Prescription created', prescription: newPrescription });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
