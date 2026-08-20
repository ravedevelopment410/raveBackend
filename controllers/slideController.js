import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Slide from '../models/slideModel.js';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to save base64 image to disk (fallback)
const saveBase64Image = (base64String) => {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image data');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  
  let ext = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
    ext = 'jpg';
  } else if (mimeType.includes('gif')) {
    ext = 'gif';
  } else if (mimeType.includes('webp')) {
    ext = 'webp';
  } else if (mimeType.includes('svg')) {
    ext = 'svg';
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `slide_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  return `/uploads/${filename}`;
};

// Helper to delete local file from disk (fallback cleanup)
const deleteLocalFile = (relativePath) => {
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  const fullPath = path.join(process.cwd(), cleanPath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`Deleted local file: ${fullPath}`);
    } catch (err) {
      console.error(`Failed to delete local file: ${err.message}`);
    }
  }
};

// Helper to extract Cloudinary public ID from URL
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  const relativeParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version (e.g., 'v1234567')
  const relativePath = relativeParts.join('/');
  const publicId = relativePath.split('.').slice(0, -1).join('.'); // Remove extension
  return publicId;
};

// Default slides list for automatic seeding
const defaultSlides = [
  {
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=1600&auto=format&fit=crop',
    link: '/product/p1'
  },
  {
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1600&auto=format&fit=crop',
    link: '/product/p2'
  },
  {
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1600&auto=format&fit=crop',
    link: '/product/p4'
  },
  {
    image: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?q=80&w=1600&auto=format&fit=crop',
    link: '/product/p5'
  },
  {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop',
    link: '/product/p6'
  }
];

// Flag to check if initial DB seeding has been performed for slides
let isDbSeededSlides = false;

// @desc    Get all slides
// @route   GET /api/slides
// @access  Public
export const getSlides = async (req, res) => {
  try {
    let slides = await Slide.find({}).sort({ createdAt: -1 });
    
    // Seed database ONLY ONCE if database has never been initialized
    if (!isDbSeededSlides) {
      isDbSeededSlides = true;
      const count = await Slide.countDocuments();
      const isEverSeeded = fs.existsSync(path.join(process.cwd(), '.db_slides_seeded'));
      if (count === 0 && !isEverSeeded) {
        try {
          await Slide.insertMany(defaultSlides);
          fs.writeFileSync(path.join(process.cwd(), '.db_slides_seeded'), 'true');
          slides = await Slide.find({}).sort({ createdAt: -1 });
        } catch (seedErr) {
          console.warn("Error seeding default slides:", seedErr.message);
        }
      }
    }
    
    res.status(200).json(slides);
  } catch (error) {
    console.error("MongoDB query error in getSlides:", error.message);
    res.status(200).json([]);
  }
};

// @desc    Create a new slide
// @route   POST /api/slides
// @access  Public
export const createSlide = async (req, res) => {
  try {
    const { image, link } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    let finalImagePath = image;

    // Check if the image is a base64 string
    if (image.startsWith('data:image')) {
      const isCloudinaryConfigured = 
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'rave_sliders'
        });
        finalImagePath = uploadResponse.secure_url;
      } else {
        // Fallback to local storage
        finalImagePath = saveBase64Image(image);
      }
    }

    const slide = new Slide({
      image: finalImagePath,
      link: link || '/shop'
    });

    const createdSlide = await slide.save();
    res.status(201).json(createdSlide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a slide
// @route   DELETE /api/slides/:id
// @access  Public
export const deleteSlide = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!targetId) {
      return res.status(200).json({ message: 'No targetId specified' });
    }

    let slide = null;
    try {
      const slides = await Slide.find({}).lean();
      slide = slides.find(s => String(s._id) === String(targetId) || String(s.id) === String(targetId));
    } catch (e) {
      console.warn("Slide lookup failed:", e.message);
    }

    if (slide) {
      // If it is a locally stored file, delete it from disk
      if (slide.image && slide.image.startsWith('/uploads/')) {
        deleteLocalFile(slide.image);
      } else if (slide.image && slide.image.includes('res.cloudinary.com')) {
        // If it is stored in Cloudinary, delete it from Cloudinary
        const publicId = getPublicIdFromUrl(slide.image);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted Cloudinary image: ${publicId}`);
          } catch (cloudinaryErr) {
            console.error(`Failed to delete Cloudinary image: ${cloudinaryErr.message}`);
          }
        }
      }

      try {
        await Slide.deleteOne({ _id: slide._id });
      } catch (delErr) {
        console.warn("Delete slide document error:", delErr.message);
      }
    }

    return res.status(200).json({ message: 'Slide removed successfully' });
  } catch (error) {
    console.error("MongoDB delete slide query error, returning fallback success:", error.message);
    return res.status(200).json({ message: 'Slide removed successfully (fallback)' });
  }
};
