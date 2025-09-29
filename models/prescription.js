const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    requestId: { type: String, required: true },
    veterinarianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true },
    medication: { type: String, required: true },
    instruction: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
