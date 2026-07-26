const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Customer = require('../models/Customer');
const Bike = require('../models/Bike');
const Inspection = require('../models/Inspection');
const Repair = require('../models/Repair');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Job = require('../models/Job');

// --- Auth ---
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }
    
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'User',
      status: role === 'Super Admin' ? 'active' : 'pending'
    });
    
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), password, role });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email, password, or role.' });
    }
    
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending Super Admin approval.' });
    }
    
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account request was rejected.' });
    }
    
    // In a real app we'd return a JWT, but here we'll just return the user profile
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Jobs (Unified Storage) ---
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    if (req.io) req.io.emit('jobCreated', savedJob);
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    if (req.io) req.io.emit('jobUpdated', updatedJob);
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
    if (req.io) req.io.emit('jobDeleted', req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Users (Staff Management) ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['Admin', 'User'] } }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


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
        const jobs = await Job.find();
        const uniqueCustomers = new Set(jobs.map(j => j.mobileNumber));
        const totalCustomers = uniqueCustomers.size;
        const activeRepairs = jobs.filter(j => j.status !== 'Completed').length;
        const recentInspections = jobs.length;
        res.json({ totalCustomers, activeRepairs, recentInspections });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
