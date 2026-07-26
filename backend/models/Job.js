const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Customer Details
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  alternateNumber: { type: String },
  address: { type: String },
  
  // Bike Details
  bikeBrand: { type: String, required: true },
  bikeModel: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  kilometerReading: { type: String },
  serviceDate: { type: String }, // Stored as YYYY-MM-DD
  
  // Job Details
  complaints: [{ type: String }],
  otherComplaint: { type: String },
  photos: {
    frontView: [{ type: String }],
    backView: [{ type: String }],
    leftSide: [{ type: String }],
    rightSide: [{ type: String }],
    odometer: [{ type: String }],
    damagedParts: [{ type: String }]
  },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  dateLogged: { type: String }, // E.g., MM/DD/YYYY from toLocaleDateString()
  
  // Repair updates
  parts: [{
    name: { type: String },
    cost: { type: Number }
  }],
  laborCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  
  // Billing updates
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  invoiceNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
