import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Old Scale: 8 pixels = 1 yard (implied)
const OLD_SCALE = 8;

const PRESET_DIRS = [
  path.join(__dirname, '../src/presets/formations'),
  path.join(__dirname, '../src/presets/plays')
];

const convertFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (!data.frames) return;

  // Check if already converted (Heuristic: coordinates are small)
  const sampleX = data.frames[0][0].x;
  if (sampleX < 200 && sampleX > 0) {
    console.log(`Skipping ${path.basename(filePath)} (Likely already converted)`);
    return;
  }

  console.log(`Converting ${path.basename(filePath)}...`);

  const newFrames = data.frames.map(frame => 
    frame.map(item => ({
      ...item,
      x: Number((item.x / OLD_SCALE).toFixed(2)),
      y: Number((item.y / OLD_SCALE).toFixed(2))
    }))
  );

  const newData = { ...data, frames: newFrames };
  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
};

PRESET_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.json')) {
        convertFile(path.join(dir, file));
      }
    });
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
});

console.log("Migration complete.");
