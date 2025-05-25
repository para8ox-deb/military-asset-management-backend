const express = require('express');
const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create transfer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { assetId, assetName, fromBaseId, toBaseId, quantity, reason } = req.body;

    // Check if asset exists and has sufficient quantity
    const asset = await Asset.findOne({ assetId, baseId: fromBaseId });
    if (!asset || asset.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient asset quantity' });
    }

    const transfer = new Transfer({
      assetId,
      assetName,
      fromBaseId,
      toBaseId,
      quantity,
      reason,
      initiatedBy: req.user._id
    });

    await transfer.save();

    res.status(201).json({ message: 'Transfer initiated successfully', transfer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve transfer
router.patch('/:id/approve', authenticateToken, authorizeRoles('admin', 'base_commander'), async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Update asset quantities
    const fromAsset = await Asset.findOne({ assetId: transfer.assetId, baseId: transfer.fromBaseId });
    fromAsset.quantity -= transfer.quantity;
    await fromAsset.save();

    let toAsset = await Asset.findOne({ assetId: transfer.assetId, baseId: transfer.toBaseId });
    if (toAsset) {
      toAsset.quantity += transfer.quantity;
      await toAsset.save();
    } else {
      toAsset = new Asset({
        assetId: transfer.assetId,
        name: transfer.assetName,
        type: fromAsset.type,
        baseId: transfer.toBaseId,
        quantity: transfer.quantity
      });
      await toAsset.save();
    }

    transfer.status = 'completed';
    transfer.approvedBy = req.user._id;
    await transfer.save();

    res.json({ message: 'Transfer approved and completed', transfer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transfers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { baseId, status } = req.query;
    let filter = {};

    if (req.user.role === 'base_commander') {
      filter.$or = [
        { fromBaseId: req.user.baseId },
        { toBaseId: req.user.baseId }
      ];
    } else if (baseId) {
      filter.$or = [
        { fromBaseId: baseId },
        { toBaseId: baseId }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const transfers = await Transfer.find(filter)
      .populate('initiatedBy', 'username')
      .populate('approvedBy', 'username')
      .sort({ transferDate: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
