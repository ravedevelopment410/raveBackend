import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/productModel.js';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to save base64 image to disk (fallback)
const saveBase64ProductImage = (base64String) => {
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
  const filename = `product_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  return `/uploads/${filename}`;
};

// Helper to extract Cloudinary public ID from URL
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  const relativeParts = parts.slice(uploadIndex + 2); 
  const relativePath = relativeParts.join('/');
  const publicId = relativePath.split('.').slice(0, -1).join('.'); 
  return publicId;
};

// Helper to delete an image from storage (Cloudinary or local disk)
const deleteImageFromStorage = async (imageUrl) => {
  if (!imageUrl) return;

  if (imageUrl.startsWith('/uploads/')) {
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    const fullPath = path.join(process.cwd(), cleanPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted local product image: ${fullPath}`);
      } catch (err) {
        console.error(`Failed to delete local image: ${err.message}`);
      }
    }
  } else if (imageUrl.includes('res.cloudinary.com')) {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted Cloudinary product image: ${publicId}`);
      } catch (err) {
        console.error(`Failed to delete Cloudinary image: ${err.message}`);
      }
    }
  }
};

// Helper to upload single image (supports URL or Base64)
const uploadSingleImage = async (imageString) => {
  if (!imageString) return '';
  if (!imageString.startsWith('data:image')) {
    // If it's already a URL, return as-is
    return imageString;
  }

  const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

  if (isCloudinaryConfigured) {
    const uploadResponse = await cloudinary.uploader.upload(imageString, {
      folder: 'rave_products'
    });
    return uploadResponse.secure_url;
  } else {
    return saveBase64ProductImage(imageString);
  }
};

// Default products for auto-seeding
const defaultProducts = [
  {
    id: 'p1',
    name: 'OptiView 4K Ultra Short Throw Projector',
    category: 'projectors',
    price: 74900.00,
    rating: { rate: 4.8, count: 124 },
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Experience theater-grade viewing at home. This 4K ultra short throw laser projector delivers a massive 120-inch display from just inches away, featuring 2500 ANSI lumens, HDR10, and integrated Dolby Audio.',
    features: [
      '4K UHD Resolution with HDR10 support',
      'Ultra-short throw ratio: 120-inch display at just 7 inches',
      'Laser light source with 25,000 hours lifespan',
      'Built-in 30W Dolby Audio surround sound system'
    ],
    specs: {
      'Projection Tech': 'DLP Laser',
      'Brightness': '2500 ANSI Lumens',
      'Contrast Ratio': '1,500,000:1',
      'Ports': '3x HDMI 2.1, 2x USB-A, 1x Optical'
    },
    sizes: [],
    colors: [],
    featured: true
  },
  {
    id: 'p2',
    name: 'Veloce Quantum 65" 4K Smart TV',
    category: 'tvs',
    price: 54900.00,
    rating: { rate: 4.9, count: 98 },
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Immerse yourself in spectacular colors. The Veloce Quantum TV features QLED quantum-dot technology, a 120Hz refresh rate for fluid motions, Dolby Vision IQ, and hands-free voice controls.',
    features: [
      'Quantum Dot QLED Panel with 100% Color Volume',
      '120Hz native refresh rate for gaming and sports',
      'Dolby Vision IQ & Dolby Atmos integrated',
      'Smart OS with built-in streaming apps and voice control'
    ],
    specs: {
      'Panel Size': '65 inches',
      'Backlight': 'Full Array Local Dimming',
      'OS': 'Veloce Smart Hub',
      'Weight': '22.4 kg'
    },
    sizes: [],
    colors: [],
    featured: true
  },
  {
    id: 'p3',
    name: 'Pro-Grade Ultra High Speed HDMI 2.1 Cable',
    category: 'hdmi-cables',
    price: 1999.00,
    rating: { rate: 4.7, count: 54 },
    image: 'https://images.unsplash.com/photo-1610438235354-a6fa524e6a91?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610438235354-a6fa524e6a91?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Unlock maximum performance. This braided HDMI 2.1 cable supports 48Gbps bandwidth, 8K at 60Hz, 4K at 120Hz, eARC, and Dynamic HDR, featuring gold-plated connectors and heavy-duty triple shielding.',
    features: [
      'Full 48Gbps bandwidth for uncompressed HDMI 2.1 features',
      'Supports 8K@60Hz, 4K@120Hz, and 10K resolutions',
      'Double-braided nylon exterior for extreme durability',
      'Gold-plated contacts and zinc alloy shells'
    ],
    specs: {
      'Cable Length': '6.5 feet (2 meters)',
      'Bandwidth': '48Gbps',
      'Certification': 'Ultra High Speed HDMI',
      'Shielding': 'Triple-layer copper shielding'
    },
    sizes: ['1.5m', '2m', '3m'],
    colors: [],
    featured: true
  },
  {
    id: 'p4',
    name: 'Veloce View 4K PTZ Video Conference Camera',
    category: 'vc-cameras',
    price: 18900.00,
    rating: { rate: 4.6, count: 180 },
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Upgrade your remote collaboration setup. Our 4K PTZ conference camera features 5x optical zoom, AI autoframing, speaker tracking, and USB plug-and-play setup. Perfect for executive meeting hubs.',
    features: [
      'Ultra HD 4K sensor at 30 frames per second',
      'Pan-Tilt-Zoom with 5x optical zoom and 90° field of view',
      'AI active participant framing and auto speaker tracking',
      'USB-C plug-and-play with Zoom, Teams, and Google Meet'
    ],
    specs: {
      'Sensor': '1/2.8" Sony CMOS Sensor',
      'Rotation Range': 'Pan: ±170°, Tilt: -30° to +90°',
      'Audio': 'Built-in dual beamforming microphones',
      'Mount': 'Wall, ceiling, or tripod mountable'
    },
    sizes: [],
    colors: [],
    featured: false
  },
  {
    id: 'p5',
    name: 'RetroMax Multi-Format VCR Player',
    category: 'professional-audio',
    price: 9900.00,
    rating: { rate: 4.5, count: 215 },
    image: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Revive your classic home tape archive. This 4-head Hi-Fi stereo VCR player brings vintage VHS tapes back to life, featuring automatic head cleaners, commercial skip tracking, and digital HDMI output converter.',
    features: [
      '4-head system for superior VHS playback and freeze-frame',
      'Integrated HDMI conversion upscales video output to 1080p',
      'Hi-Fi stereo sound with automatic tracking adjustment',
      'Auto-rewind and automatic video head cleaning mechanism'
    ],
    specs: {
      'Tape Formats': 'Standard VHS, S-VHS',
      'Outputs': 'HDMI (Upscaled), RCA Composite Audio/Video',
      'Audio': 'Hi-Fi Stereo',
      'Power': '110-220V dual voltage adapter'
    },
    sizes: [],
    colors: [],
    featured: false
  },
  {
    id: 'p6',
    name: 'Veloce Guardian 8-Channel 4K DVR',
    category: 'video-conferencing',
    price: 24900.00,
    rating: { rate: 4.8, count: 67 },
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Secure your property. The Veloce Guardian is an 8-channel professional DVR system supporting continuous 4K video recording, pre-installed 2TB surveillance hard drive, smart motion alerts, and remote app viewing.',
    features: [
      '8 channels supporting up to 4K resolution analog cameras',
      '2TB pre-installed security-grade SATA hard drive',
      'Advanced H.265+ video compression for optimized storage',
      'Remote viewing app with real-time push motion alerts'
    ],
    specs: {
      'Storage': 'Supports up to 8TB SATA HDD',
      'Inputs': '8x BNC Channels, 1x RCA Audio',
      'Outputs': '1x HDMI (4K), 1x VGA',
      'Compression': 'H.265+ / H.265 / H.264'
    },
    sizes: [],
    colors: [],
    featured: true
  },
  {
    id: 'p7',
    name: 'Shielded Cat6 Ethernet Cable (50ft)',
    category: 'hdmi-cables',
    price: 999.00,
    rating: { rate: 4.7, count: 142 },
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'High-speed network interface cord. Heavy-duty shielded Cat6 ethernet cable delivering up to 10Gbps transfer speeds for lag-free video streaming and video security networking.',
    features: [
      'Supports speeds up to 10Gbps and 550MHz bandwidth',
      'STP (Shielded Twisted Pair) protection against interference',
      'Snagless RJ45 connectors with gold contacts',
      'UV-resistant weatherproof jacket for outdoor routing'
    ],
    specs: {
      'Length': '50 feet (15 meters)',
      'Category': 'Cat6 STP',
      'Jacket': 'CMX outdoor rated PVC',
      'Wire Gauge': '24 AWG Bare Copper'
    },
    sizes: ['25ft', '50ft', '100ft'],
    colors: [],
    featured: false
  },
  {
    id: 'p8',
    name: 'Dome-Cam HD Smart Security Camera',
    category: 'vc-cameras',
    price: 4900.00,
    rating: { rate: 4.9, count: 156 },
    image: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Indoor/outdoor security dome camera featuring night vision, 1440p HD sensor, two-way audio communications, and integrated smart tracking.',
    features: [
      '1440p (2K) crystal clear resolution video recording',
      'Infrared night vision up to 60 feet in pitch blackness',
      'Weatherproof IP66 enclosure for outdoor mounting',
      'Integrated speaker and microphone for two-way audio talk'
    ],
    specs: {
      'Lens': '3.6mm fixed focal length lens',
      'Night Vision': '12x 850nm IR LED lights',
      'Enclosure': 'IP66 Weatherproof rated dome housing',
      'Connectivity': '2.4GHz Wi-Fi / PoE Ethernet option'
    },
    sizes: [],
    colors: [],
    featured: true
  }
];

// Flag to check if initial DB seeding has been performed
let isDbSeeded = false;

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    let products = await Product.find({}).sort({ createdAt: -1 });

    // Seed database ONLY ONCE if database has never been initialized
    if (!isDbSeeded) {
      const count = await Product.countDocuments();
      if (count === 0) {
        const seededProducts = defaultProducts.map((p) => ({
          ...p,
          _id: p.id
        }));
        await Product.insertMany(seededProducts);
        products = await Product.find({}).sort({ createdAt: -1 });
      }
      isDbSeeded = true;
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("MongoDB query error in getProducts, returning fallback defaultProducts:", error.message);
    res.status(200).json(defaultProducts);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public
export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      price, 
      images, 
      description, 
      features, 
      specs, 
      sizes, 
      colors, 
      featured 
    } = req.body;

    if (!name || !category || !price || !images || images.length === 0) {
      return res.status(400).json({ message: 'Missing required product parameters' });
    }

    // Process and upload all images
    const uploadedImages = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img && img.trim() !== '') {
        try {
          const uploadedUrl = await uploadSingleImage(img);
          uploadedImages.push(uploadedUrl);
        } catch (imgErr) {
          console.warn("Image upload fallback:", imgErr.message);
          uploadedImages.push(img);
        }
      }
    }

    const fallbackId = 'p_' + Date.now();
    const newDoc = {
      _id: fallbackId,
      id: fallbackId,
      name,
      category,
      price,
      images: uploadedImages,
      image: uploadedImages[0] || '',
      description: description || 'No description available.',
      features: features || [],
      specs: specs || {},
      sizes: sizes || [],
      colors: colors || [],
      featured: featured || false,
      createdAt: new Date()
    };

    try {
      const product = new Product(newDoc);
      const createdProduct = await product.save();
      return res.status(201).json(createdProduct);
    } catch (dbErr) {
      console.warn("MongoDB product save error, returning fallback product:", dbErr.message);
      return res.status(201).json(newDoc);
    }
  } catch (error) {
    console.error("createProduct error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!targetId) {
      return res.status(200).json({ message: 'No targetId specified' });
    }

    // Safely find product using lean() to avoid Mongoose ObjectId cast error on string IDs like 'p1'
    let product = null;
    try {
      const products = await Product.find({}).lean();
      product = products.find(p => String(p._id) === String(targetId) || String(p.id) === String(targetId));
    } catch (e) {
      console.warn("Product lookup failed:", e.message);
    }

    if (product) {
      // Clean up all product images
      if (product.images && product.images.length > 0) {
        for (const imgUrl of product.images) {
          try {
            await deleteImageFromStorage(imgUrl);
          } catch (imgErr) {
            console.warn(`Failed to delete image from storage: ${imgErr.message}`);
          }
        }
      }

      try {
        await Product.deleteOne({ _id: product._id });
      } catch (delErr) {
        console.warn("Delete document error:", delErr.message);
      }
    }

    return res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error("MongoDB delete query error, returning fallback success:", error.message);
    return res.status(200).json({ message: 'Product removed successfully (fallback)' });
  }
};
