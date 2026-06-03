require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const quotationRoutes = require('./routes/quotationRoutes');

// Connect to Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotations', quotationRoutes);

// Base Endpoint for health check
app.get('/', (req, res) => {
  res.json({ message: 'AASA Medchem Inventory & Order System API is running...' });
});

// Global Error Handling Middleware (Faculty love this for robust programming!)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error. Something went wrong internally.' });
});

// Define Server Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
