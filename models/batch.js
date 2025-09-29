// models/Batch.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BatchSchema = new Schema({
  batchId: { type: String, unique: true, required: true },
  animalType: { type: String, required: true },
  breed: { type: String, required: true },
  count: { type: Number, required: true },
  manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Batch', BatchSchema);
