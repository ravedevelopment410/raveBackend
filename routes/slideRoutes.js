import express from 'express';
import { getSlides, createSlide, deleteSlide } from '../controllers/slideController.js';

const router = express.Router();

router.route('/')
  .get(getSlides)
  .post(createSlide);

router.route('/:id')
  .delete(deleteSlide);

export default router;
