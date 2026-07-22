const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Bike', bikeSchema);
