const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Request = require('../models/Request');
const { generateId } = require('../utils/idGenerator');

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        const activeBatches = await Batch.countDocuments({ status: 'Active' });
        const pendingRequests = await Request.countDocuments({ status: 'Pending' });
        const awaitingApproval = pendingRequests; // same as pending for now
        const generatedReports = 0; // you can implement a Report model later

        const recentBatches = await Batch.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            stats: { activeBatches, pendingRequests, awaitingApproval, generatedReports },
            recentBatches
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new batch
router.post('/create-batch', async (req, res) => {
    const { batchSize, animalCount } = req.body;
    const batchId = generateId('BATCH');

    try {
        const newBatch = new Batch({ batchId, batchSize, animalCount });
        await newBatch.save();
        res.status(201).json({ message: 'Batch created', batch: newBatch });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// View all batches
router.get('/view-batches', async (req, res) => {
    try {
        const batches = await Batch.find().sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Treatment request management
router.get('/requests', async (req, res) => {
    try {
        const requests = await Request.find().populate('farmerId animalId');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/requests/:id/approve', async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        request.status = 'Approved';
        await request.save();
        res.json({ message: 'Request approved', request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/requests/:id/reject', async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        request.status = 'Rejected';
        await request.save();
        res.json({ message: 'Request rejected', request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reports (simple placeholder)
router.post('/reports', async (req, res) => {
    const { reportType, fromDate, toDate } = req.body;
    // Implement report generation logic here
    res.json({ message: 'Report generated', reportType, fromDate, toDate });
});

module.exports = router;
