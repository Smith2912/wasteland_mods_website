const fs = require('fs');
const path = require('path');

// Paths to create
const paths = [
  'public/images',
  'public/images/mods',
  'public/images/hero',
  'public/images/about',
];

// Create directories if they don't exist
paths.forEach(dirPath => {
  const fullPath = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
});

// Create a simple placeholder text file in each directory
paths.forEach(dirPath => {
  const fullPath = path.join(process.cwd(), dirPath, 'placeholder.txt');
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(
      fullPath, 
      `This is a placeholder file for the ${dirPath} directory.\n\nReplace with actual images.`
    );
    console.log(`Created placeholder file in: ${dirPath}`);
  } else {
    console.log(`Placeholder file already exists in: ${dirPath}`);
  }
});

console.log('\nDone! Image directories are ready for use.');
console.log('Add your DayZ mod images to these directories:');
console.log('- public/images/mods/ - For mod card images');
console.log('- public/images/hero/ - For hero banner images');
console.log('- public/images/about/ - For about page images'); 