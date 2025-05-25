const express = require('express');
const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create assignment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { assetId, assetName, baseId, assignedTo, quantity, expectedReturnDate, purpose } = req.body;

    // Check asset availability
    const asset = await Asset.findOne({ assetId, baseId });
    if (!asset || (asset.quantity - asset.assignedQuantity) < quantity) {
      return res.status(400).json({ message: 'Insufficient available asset quantity' });
    }

    const assignment = new Assignment({
      assetId,
      assetName,
      baseId,
      assignedTo,
      assignedBy: req.user._id,
      quantity,
      expectedReturnDate,
      purpose
    });

    await assignment.save();

    // Update asset assigned quantity
    asset.assignedQuantity += quantity;
    await asset.save();

    res.status(201).json({ message: 'Asset assigned successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark as expended
router.patch('/:id/expend', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = 'expended';
    await assignment.save();

    // Update asset quantities
    const asset = await Asset.findOne({ assetId: assignment.assetId, baseId: assignment.baseId });
    asset.assignedQuantity -= assignment.quantity;
    asset.expendedQuantity += assignment.quantity;
    asset.quantity -= assignment.quantity;
    await asset.save();

    res.json({ message: 'Asset marked as expended', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { baseId, status } = req.query;
    let filter = {};

    if (req.user.role === 'base_commander') {
      filter.baseId = req.user.baseId;
    } else if (baseId) {
      filter.baseId = baseId;
    }

    if (status) {
      filter.status = status;
    }

    const assignments = await Assignment.find(filter)
      .populate('assignedBy', 'username')
      .sort({ assignmentDate: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
