const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  phone: { type: String, unique: true, required: true },
  role: { type: String, enum: ['farmer','manager','vet','pharmacist','dairy'], default: 'farmer' },
  name: { type: String },
  farmName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
