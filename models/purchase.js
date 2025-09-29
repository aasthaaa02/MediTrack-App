const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'DairyProduct', required: true },
    dairyManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantityPurchased: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    purchasedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
