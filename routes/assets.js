const express = require('express');
const Asset = require('../models/Asset');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all assets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { baseId, type } = req.query;
    let filter = {};

    if (req.user.role === 'base_commander') {
      filter.baseId = req.user.baseId;
    } else if (baseId) {
      filter.baseId = baseId;
    }

    if (type) {
      filter.type = type;
    }

    const assets = await Asset.find(filter).sort({ name: 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
