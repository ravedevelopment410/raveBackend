import express from 'express';
import { getProducts, createProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .delete(deleteProduct);

export default router;
