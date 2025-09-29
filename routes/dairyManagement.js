const express = require('express');
const router = express.Router();
const Animal = require('../models/animal');
const DairyProduct = require('../models/dairyProduct');
const Purchase = require('../models/purchase');
const authMiddleware = require('../middleware/authMiddleware');

// Dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const registeredDairyCows = await Animal.countDocuments({ type: 'Dairy' });
        const productsAvailable = await DairyProduct.countDocuments();
        const purchasesMade = await Purchase.countDocuments();

        res.json({ registeredDairyCows, productsAvailable, purchasesMade });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// View dairy animals with search
router.get('/view-animals', authMiddleware, async (req, res) => {
    try {
        const { animalId, farmerId, breed } = req.query;
        let filter = { type: 'Dairy' };

        if (animalId) filter._id = animalId;
        if (farmerId) filter.farmerId = farmerId;
        if (breed) filter.breed = breed;

        const animals = await Animal.find(filter);
        res.json(animals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Purchase dairy products
router.get('/products', authMiddleware, async (req, res) => {
    try {
        const products = await DairyProduct.find().populate('farmer');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/purchase', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const dairyManagerId = req.user._id;

        const product = await DairyProduct.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.quantityAvailable < quantity) return res.status(400).json({ message: 'Not enough quantity available' });

        const totalAmount = quantity * product.pricePerUnit;

        const purchase = new Purchase({
            product: productId,
            dairyManager: dairyManagerId,
            quantityPurchased: quantity,
            totalAmount
        });

        await purchase.save();

        // Reduce available quantity
        product.quantityAvailable -= quantity;
        await product.save();

        res.status(201).json({ message: 'Purchase successful', purchase });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
