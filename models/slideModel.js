import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image path or URL is required']
  },
  link: {
    type: String,
    default: '/shop'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Slide = mongoose.model('Slide', slideSchema);

export default Slide;
