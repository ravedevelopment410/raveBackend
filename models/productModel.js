import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  rating: {
    rate: {
      type: Number,
      default: 5.0
    },
    count: {
      type: Number,
      default: 1
    }
  },
  image: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: 'No description available.'
  },
  features: {
    type: [String],
    default: []
  },
  specs: {
    type: Map,
    of: String,
    default: {}
  },
  sizes: {
    type: [String],
    default: []
  },
  colors: [
    {
      name: { type: String },
      hex: { type: String }
    }
  ],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
