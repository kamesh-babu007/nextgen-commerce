import { Router } from 'express';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import prisma from '../../db';

const router = Router();

// All admin routes are protected
router.use(authenticateJWT);
router.use(requireRole(['VENDOR', 'ADMIN']));

router.get('/dashboard', (req, res) => {
  // Simulate active dashboard metrics for the Vendor Hub
  // Gross order totals, active pipelines
  res.json({ 
    message: 'Welcome to the vendor dashboard.', 
    data: { 
      revenue: 142050,
      activeOrders: 84,
      completedTransactions: 312
    } 
  });
});

router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock_quantity: Number(stock_quantity || 0)
      }
    });

    res.status(201).json({ message: 'Product created.', product });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : undefined
      }
    });

    res.json({ message: 'Product updated.', product });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
