import { Router } from 'express';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import prisma from '../../db';

const router = Router();

// Public routes for marketplace
router.get('/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const where: any = {
      stock_quantity: { gt: 0 }
    };

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    
    // Schema doesn't actually have 'category', but we can ignore it for now or implement if schema allows.
    // The schema only has name, description, price, stock_quantity.

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes for customers
router.post('/checkout', authenticateJWT, requireRole(['CUSTOMER']), async (req, res) => {
  const { items } = req.body; // Array of { productId, quantity }
  // @ts-ignore
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      let totalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        // Decrease stock
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock_quantity: { decrement: item.quantity } }
        });

        if (product.stock_quantity < 0) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        totalPrice += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          items: {
            create: orderItemsData
          }
        }
      });
      return order;
    });

    res.json({ message: 'Checkout successful.' });
  } catch (error: any) {
    console.error('Checkout error:', error.message);
    res.status(400).json({ error: error.message || 'Checkout failed due to insufficient stock.' });
  }
});

export default router;
