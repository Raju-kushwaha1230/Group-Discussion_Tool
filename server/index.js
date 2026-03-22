const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const initSockets = require('./sockets/index');

// Route files
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

// Connect to Database and Redis
connectDB();
connectRedis();

const app = express();
const server = http.createServer(app);

// Initialize Sockets with passing the server
initSockets(server);

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
  credentials: true 
}));
app.use(helmet()); // Security headers
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // HTTP request logging
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
