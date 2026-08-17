import express from 'express';
import { getSamples, createSample } from '../controllers/sampleController.js';

const router = express.Router();

router.route('/')
  .get(getSamples)
  .post(createSample);

export default router;
