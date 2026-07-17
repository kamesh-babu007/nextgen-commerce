import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import storeRoutes from './modules/store/store.routes';
import adminRoutes from './modules/admin/admin.routes';
import authRoutes from './modules/auth/auth.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Gateways
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NextGen Commerce API is running.' });
});

export default app;
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`NextGen Commerce API live on port ${port}`);
});