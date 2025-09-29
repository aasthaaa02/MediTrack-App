const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnimalSchema = new Schema({
  animalId: { type: String, unique: true, required: true }, // auto-generated A-xxxx
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Cow','Horse','Sheep','Goat','Chicken'], required: true },
  weightKg: { type: Number },
  description: { type: String },
  photo: { type: String }, // path to uploaded image
}, { timestamps: true });

module.exports = mongoose.model('Animal', AnimalSchema);
