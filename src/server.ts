import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import employeeRoutes from './routes/employeeRoutes';
import scheduleRoute from './routes/scheduleRoutes';
import customerRoutes from './routes/customerRoutes';
import serviceRoutes from './routes/serviceRoutes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/schedule', scheduleRoute);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] Сервер запущен на http://localhost:${PORT}`);
  console.log(`[INFO] API доступно по /api`);
});