const express = require('express');
const Purchase = require('../models/Purchase');
const Asset = require('../models/Asset');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create purchase
router.post('/', authenticateToken, authorizeRoles('admin', 'logistics_officer'), async (req, res) => {
  try {
    const { assetId, assetName, assetType, baseId, quantity, unitPrice, vendor } = req.body;

    const purchase = new Purchase({
      assetId,
      assetName,
      assetType,
      baseId,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      vendor,
      purchasedBy: req.user._id
    });

    await purchase.save();

    // Update or create asset
    let asset = await Asset.findOne({ assetId, baseId });
    if (asset) {
      asset.quantity += quantity;
      await asset.save();
    } else {
      asset = new Asset({
        assetId,
        name: assetName,
        type: assetType,
        baseId,
        quantity
      });
      await asset.save();
    }

    res.status(201).json({ message: 'Purchase recorded successfully', purchase });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get purchases
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { baseId, startDate, endDate, assetType } = req.query;
    let filter = {};

    if (req.user.role === 'base_commander') {
      filter.baseId = req.user.baseId;
    } else if (baseId) {
      filter.baseId = baseId;
    }

    if (startDate && endDate) {
      filter.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (assetType) {
      filter.assetType = assetType;
    }

    const purchases = await Purchase.find(filter)
      .populate('purchasedBy', 'username')
      .sort({ purchaseDate: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
