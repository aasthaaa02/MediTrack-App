const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    batchSize: { type: Number, required: true },
    animalCount: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    animals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }]
});

module.exports = mongoose.model('Batch', batchSchema);
