import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sample = mongoose.model('Sample', sampleSchema);

export default Sample;
