const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  description: { type: String, required: true },
  parts: [{
    name: { type: String, required: true },
    cost: { type: Number, required: true }
  }],
  laborCost: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Repair', repairSchema);
