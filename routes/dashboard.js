const express = require('express');
const Asset = require('../models/Asset');
const Purchase = require('../models/Purchase');
const Transfer = require('../models/Transfer');
const Assignment = require('../models/Assignment');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { baseId, startDate, endDate, assetType } = req.query;
    let baseFilter = {};

    if (req.user.role === 'base_commander') {
      baseFilter.baseId = req.user.baseId;
    } else if (baseId) {
      baseFilter.baseId = baseId;
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let typeFilter = {};
    if (assetType) {
      typeFilter.assetType = assetType;
    }

    // Get current assets (closing balance)
    const assets = await Asset.find({
      ...baseFilter,
      ...(assetType && { type: assetType })
    });

    const closingBalance = assets.reduce((sum, asset) => sum + asset.quantity, 0);
    const assignedAssets = assets.reduce((sum, asset) => sum + asset.assignedQuantity, 0);
    const expendedAssets = assets.reduce((sum, asset) => sum + asset.expendedQuantity, 0);

    // Get purchases (transfer in)
    const purchases = await Purchase.find({
      ...baseFilter,
      ...typeFilter,
      ...(startDate && endDate && { purchaseDate: dateFilter })
    });
    const purchaseQuantity = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

    // Get transfers in
    const transfersIn = await Transfer.find({
      toBaseId: baseFilter.baseId || { $exists: true },
      status: 'completed',
      ...typeFilter,
      ...(startDate && endDate && { transferDate: dateFilter })
    });
    const transferInQuantity = transfersIn.reduce((sum, transfer) => sum + transfer.quantity, 0);

    // Get transfers out
    const transfersOut = await Transfer.find({
      fromBaseId: baseFilter.baseId || { $exists: true },
      status: 'completed',
      ...typeFilter,
      ...(startDate && endDate && { transferDate: dateFilter })
    });
    const transferOutQuantity = transfersOut.reduce((sum, transfer) => sum + transfer.quantity, 0);

    const netMovement = purchaseQuantity + transferInQuantity - transferOutQuantity;
    const openingBalance = closingBalance - netMovement;

    res.json({
      openingBalance,
      closingBalance,
      netMovement,
      assignedAssets,
      expendedAssets,
      purchases: purchaseQuantity,
      transferIn: transferInQuantity,
      transferOut: transferOutQuantity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
