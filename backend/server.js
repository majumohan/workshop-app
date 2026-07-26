require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const User = require('./models/User');

const app = express();

// Connect to database
connectDB().then(async () => {
  try {
    const superAdminExists = await User.findOne({ role: 'Super Admin' });
    if (!superAdminExists) {
      const defaultAdmin = new User({
        name: 'Super Admin',
        email: 'superadmin@gadgetspitstop.com',
        password: 'superadmin123', // Default password for dev purposes
        role: 'Super Admin',
        status: 'active'
      });
      await defaultAdmin.save();
      console.log('Default Super Admin account created.');
    }
  } catch (err) {
    console.error('Error checking/creating default Super Admin:', err);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
