/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ok230176\\.gemini\\antigravity\\brain\\8a29b90e-96b8-4f37-92a5-1821c3db3af7\\.system_generated\\steps\\31\\content.md', 'utf-8');

const latLngRegex = /34\.7\d{4,}/g;
const lngRegex = /135\.5\d{4,}/g;

const lats = content.match(latLngRegex);
const lngs = content.match(lngRegex);

console.log('Lats found:', lats ? lats.length : 0);
console.log('Lngs found:', lngs ? lngs.length : 0);

const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/g;
let match;
while ((match = scriptRegex.exec(content)) !== null) {
  if (match[1].includes('34.7')) {
    console.log('Found coordinates in a script tag!');
    console.log(match[1].substring(0, 200));
  }
}

// Find any data attributes containing coords
const lines = content.split('\n');
const linesWithCoords = lines.filter(line => line.includes('34.7') || line.includes('lat'));
console.log('Lines with coords/lat:', linesWithCoords.slice(0, 10));
