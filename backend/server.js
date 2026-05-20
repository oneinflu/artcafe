const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Use Routes
console.log('Registering routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/case-studies', require('./routes/caseStudies'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/attributes', require('./routes/attributes'));
app.use('/api/bulk-requests', require('./routes/bulkRequests'));
app.use('/api/case-studies', require('./routes/caseStudies'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/architects', require('./routes/architects'));
console.log('Routes registered.');

// Serve static assets from the Vite React frontend build folder (one directory level up)
app.use(express.static(path.join(__dirname, '../dist')));

// Wildcard route to handle React Router client-side routing
app.get('*', (req, res, next) => {
  // If the request is for API or uploads, pass it to the 404/API handlers
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

// 404 Not Found Handler
app.use((req, res, next) => {
  console.log(`404 Hit: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ msg: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Something went wrong on the server', error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
