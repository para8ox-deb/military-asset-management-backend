const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  fromBaseId: {
    type: String,
    required: true
  },
  toBaseId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_transit', 'completed', 'rejected'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);
