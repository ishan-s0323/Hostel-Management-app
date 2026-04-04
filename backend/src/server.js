require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./utils/db');

// Route imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const staffRoutes = require('./routes/staff');
const blockRoutes = require('./routes/blocks');
const roomRoutes = require('./routes/rooms');
const allocationRoutes = require('./routes/allocations');
const feeRoutes = require('./routes/fees');
const paymentRoutes = require('./routes/payments');
const complaintRoutes = require('./routes/complaints');
const inquiryRoutes = require('./routes/inquiries');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const auditRoutes = require('./routes/audit');
const reportRoutes = require('./routes/reports');
const biometricRoutes = require('./routes/biometric');
const parcelRoutes = require('./routes/parcels');
const visitorRoutes = require('./routes/visitors');
const lostfoundRoutes = require('./routes/lostfound');
const requestRoutes = require('./routes/requests');
const roommateRoutes = require('./routes/roommates');
const feedbackRoutes = require('./routes/feedback');
const laundryRoutes = require('./routes/laundry');
const housekeepingRoutes = require('./routes/housekeeping');
const emergencyRoutes = require('./routes/emergency');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/lostfound', lostfoundRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Initialize DB pool, then start server
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => { await db.close(); process.exit(0); });
process.on('SIGINT', async () => { await db.close(); process.exit(0); });

module.exports = app;
