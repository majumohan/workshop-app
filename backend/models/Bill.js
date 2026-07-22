const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  repairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  dateIssued: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
