const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// List of images to create
const imagesToCreate = [
  { path: 'public/images/hero-dayz.jpg', width: 1920, height: 1080, text: 'Hero Banner', color: '#375a7f' },
  { path: 'public/images/about-banner.jpg', width: 1200, height: 600, text: 'About Banner', color: '#2c3e50' },
  { path: 'public/images/mods/vehicle-protection.jpg', width: 600, height: 400, text: 'Vehicle Protection', color: '#e74c3c' },
  { path: 'public/images/mods/zombies.jpg', width: 600, height: 400, text: 'Advanced Zombies', color: '#27ae60' },
  { path: 'public/images/mods/weather.jpg', width: 600, height: 400, text: 'Weather System', color: '#3498db' },
  { path: 'public/images/mods/trader.jpg', width: 600, height: 400, text: 'Trader System', color: '#f39c12' },
  { path: 'public/images/mods/vehicles.jpg', width: 600, height: 400, text: 'Vehicle Pack', color: '#9b59b6' },
  { path: 'public/images/mods/base-building.jpg', width: 600, height: 400, text: 'Base Building', color: '#1abc9c' },
];

// Function to create a placeholder image
function createPlaceholderImage(width, height, text, backgroundColor) {
  // Create a canvas with the specified dimensions
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill the background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(width / 20)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Add dimensions text
  ctx.font = `${Math.floor(width / 40)}px Arial`;
  ctx.fillText(`${width}x${height}`, width / 2, height / 2 + Math.floor(width / 15));

  return canvas.toBuffer('image/jpeg');
}

// Create each image
imagesToCreate.forEach(image => {
  const fullPath = path.join(process.cwd(), image.path);
  const dirPath = path.dirname(fullPath);

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Generate and save the image
  try {
    const imageBuffer = createPlaceholderImage(image.width, image.height, image.text, image.color);
    fs.writeFileSync(fullPath, imageBuffer);
    console.log(`Created placeholder image: ${image.path}`);
  } catch (error) {
    console.error(`Error creating ${image.path}:`, error);
  }
});

console.log('\nDone! All placeholder images have been created.');
console.log('Restart your development server to see the changes.'); 