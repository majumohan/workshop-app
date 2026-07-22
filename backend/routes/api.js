const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Customer = require('../models/Customer');
const Bike = require('../models/Bike');
const Inspection = require('../models/Inspection');
const Repair = require('../models/Repair');
const Bill = require('../models/Bill');

// --- Customers ---
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/customers', async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Bikes ---
router.get('/bikes', async (req, res) => {
  try {
    const bikes = await Bike.find().populate('customerId');
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/bikes/customer/:customerId', async (req, res) => {
  try {
    const bikes = await Bike.find({ customerId: req.params.customerId });
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bikes', async (req, res) => {
  const bike = new Bike(req.body);
  try {
    const newBike = await bike.save();
    res.status(201).json(newBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Inspections ---
router.get('/inspections', async (req, res) => {
  try {
    const inspections = await Inspection.find().populate({
      path: 'bikeId',
      populate: { path: 'customerId' }
    });
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/inspections', upload.array('photos', 5), async (req, res) => {
  try {
    const photoPaths = req.files ? req.files.map(file => file.path) : [];
    
    // Parse checklist if it's sent as a JSON string
    let checklist = req.body.checklist;
    if (typeof checklist === 'string') {
        try { checklist = JSON.parse(checklist); } catch (e) { }
    }

    const inspection = new Inspection({
      bikeId: req.body.bikeId,
      checklist: checklist || [],
      notes: req.body.notes,
      photos: photoPaths
    });
    const newInspection = await inspection.save();
    res.status(201).json(newInspection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Repairs ---
router.get('/repairs', async (req, res) => {
  try {
    const repairs = await Repair.find().populate({
      path: 'bikeId',
      populate: { path: 'customerId' }
    });
    res.json(repairs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/repairs', async (req, res) => {
  const repair = new Repair(req.body);
  try {
    const newRepair = await repair.save();
    res.status(201).json(newRepair);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Bills ---
router.get('/bills', async (req, res) => {
  try {
    const bills = await Bill.find().populate('customerId repairId');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bills', async (req, res) => {
  const bill = new Bill(req.body);
  try {
    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Dashboard Stats ---
router.get('/stats', async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeRepairs = await Repair.countDocuments({ status: { $ne: 'Completed' } });
        const recentInspections = await Inspection.countDocuments(); // Could limit to last 7 days
        res.json({ totalCustomers, activeRepairs, recentInspections });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
})

module.exports = router;
