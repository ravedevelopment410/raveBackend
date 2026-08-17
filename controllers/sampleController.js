import Sample from '../models/sampleModel.js';

// @desc    Get all samples
// @route   GET /api/samples
// @access  Public
export const getSamples = async (req, res) => {
  try {
    const samples = await Sample.find({});
    res.status(200).json(samples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a sample
// @route   POST /api/samples
// @access  Public
export const createSample = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const sample = new Sample({
      title,
      description
    });
    
    const createdSample = await sample.save();
    res.status(201).json(createdSample);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
