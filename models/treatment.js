const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TreatmentSchema = new Schema({
  requestId: { type: String, unique: true, required: true },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  animal: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
  symptoms: { type: String, required: true },
  status: { type: String, enum: ['Pending','Active','Completed'], default: 'Pending' },
  createdAtLocal: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Treatment', TreatmentSchema);
