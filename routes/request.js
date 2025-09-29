const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    symptoms: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
