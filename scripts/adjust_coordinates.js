import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILES_TO_ADJUST = [
  path.join(__dirname, '../src/presets/plays/facial.json'),
  path.join(__dirname, '../src/presets/plays/creampie.json')
];

const adjustFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  console.log(`Adjusting ${path.basename(filePath)}...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  const newFrames = data.frames.map(frame => 
    frame.map(item => ({
      ...item,
      x: Number((item.x - 8).toFixed(2)),
      y: Number((item.y - 1.5).toFixed(2))
    }))
  );

  const newData = { ...data, frames: newFrames };
  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
};

FILES_TO_ADJUST.forEach(adjustFile);
console.log("Adjustment complete.");
