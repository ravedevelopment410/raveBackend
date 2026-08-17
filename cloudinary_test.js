import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary with inline credentials
cloudinary.config({
  cloud_name: 'drenticfl',
  api_key: '765976428957559',
  api_secret: 'RJg0DGdUFbamtJp_hnzO9B5qd44'
});

async function runOnboarding() {
  try {
    console.log('Uploading sample image to Cloudinary...');
    
    // 2. Upload sample image from Cloudinary's demo domains
    const uploadResult = await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', {
      folder: 'onboarding_demo'
    });
    
    console.log('\n--- UPLOAD SUCCESS ---');
    console.log(`Secure URL: ${uploadResult.secure_url}`);
    console.log(`Public ID: ${uploadResult.public_id}`);
    
    // 3. Get image details (metadata)
    console.log('\n--- IMAGE METADATA ---');
    console.log(`Width: ${uploadResult.width}px`);
    console.log(`Height: ${uploadResult.height}px`);
    console.log(`Format: ${uploadResult.format}`);
    console.log(`File Size: ${uploadResult.bytes} bytes`);
    
    // 4. Transform the image
    // f_auto: Automatically selects the most optimized format (e.g. webp, avif) based on browser support
    // q_auto: Automatically adjusts the image quality compression to minimize file size without visible loss
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto', // f_auto
      quality: 'auto',      // q_auto
      secure: true
    });
    
    console.log('\n--- OPTIMIZATION AND TRANSFORMATION ---');
    console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
    console.log(`Transformed URL: ${transformedUrl}`);
    
  } catch (error) {
    console.error('Error during onboarding script execution:', error.message);
  }
}

runOnboarding();
