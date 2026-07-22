const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  date: { type: Date, default: Date.now },
  checklist: [{
    item: { type: String, required: true },
    status: { type: String, enum: ['Pass', 'Fail', 'Needs Attention'], default: 'Pass' },
    comments: { type: String }
  }],
  notes: { type: String },
  photos: [{ type: String }] // Array of file paths
}, { timestamps: true });

module.exports = mongoose.model('Inspection', inspectionSchema);
