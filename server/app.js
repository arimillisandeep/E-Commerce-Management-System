const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---- Global middleware ----
app.use(helmet()); // security HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json()); // parse JSON bodies
app.use(morgan('dev')); // request logging

// ---- API routes ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'E-Commerce API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found.' });
});

// Serve the built React app in production (single-service deployment).
// client/dist is created by `npm --prefix client run build`.
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API GET route serves index.html (React Router handles it)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Development mode (no build yet): show API info at the root
  app.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: 'E-Commerce API server is running.',
      docs: 'Build the client (npm run build) or use the Vite dev server at http://localhost:5173',
    });
  });
}

// Central error handler (last)
app.use(errorHandler);

module.exports = app;
