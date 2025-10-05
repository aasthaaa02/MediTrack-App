const mongoose = require('mongoose');
const { Schema } = mongoose;

const BatchSchema = new Schema({
  batchId: { type: String, unique: true, required: true },
  animalType: { type: String, required: true },
  breed: { type: String, required: true },
  count: { type: Number, required: true },
  manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ✅ Prevent "Cannot overwrite `Batch` model once compiled" error
module.exports = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
