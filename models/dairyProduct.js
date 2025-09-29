const mongoose = require('mongoose');

const dairyProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantityAvailable: { type: Number, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pricePerUnit: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DairyProduct', dairyProductSchema);
