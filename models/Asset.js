const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['weapon', 'vehicle', 'ammunition', 'equipment']
  },
  baseId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  assignedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  expendedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  specifications: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
