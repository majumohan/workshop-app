require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const User = require('./models/User');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Inject io into request
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
