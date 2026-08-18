import dns from 'dns';
// Set DNS servers to Google DNS to fix querySrv ECONNREFUSED errors caused by local ISP DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import sampleRoutes from './routes/sampleRoutes.js';
import slideRoutes from './routes/slideRoutes.js';
import productRoutes from './routes/productRoutes.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
// Increased body parser limit to support base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/samples', sampleRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/products', productRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
