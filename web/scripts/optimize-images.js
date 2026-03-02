const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/default');
const outputDir = path.join(__dirname, '../public/default');
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 75;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach((file) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(/\.[^.]+$/, '.webp'));

  sharp(inputPath)
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: 'inside',
    })
    .webp({ quality: QUALITY })
    .toFile(outputPath)
    .then(() => console.log(`✅ Optimized: ${file}`))
    .catch((err) => console.error(`❌ Error with ${file}:`, err));
});
