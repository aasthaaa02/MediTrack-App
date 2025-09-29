const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillSchema = new Schema({
  billId: { type: String, unique: true, required: true },
  prescriptionId: { type: String, required: true }, // treatment.requestId
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  animal: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending','Paid'], default: 'Pending' },
  createdAtLocal: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);
