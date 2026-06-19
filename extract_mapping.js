const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ok230176\\.gemini\\antigravity\\brain\\8a29b90e-96b8-4f37-92a5-1821c3db3af7\\.system_generated\\steps\\31\\content.md', 'utf-8');

const regex = /<a href="\/churinjo\/viewer\/\?landmark=([^"]+)">[\s\S]*?<div class="name">([^<]+)<\/div>/g;
let match;
const mapping = {};
while ((match = regex.exec(content)) !== null) {
  mapping[match[1]] = match[2];
}

console.log(`Found ${Object.keys(mapping).length} mappings.`);
console.log(Object.entries(mapping).slice(0, 10));

fs.writeFileSync('C:\\Users\\ok230176\\.gemini\\antigravity\\scratch\\bicycle-parking-app\\mapping.json', JSON.stringify(mapping, null, 2));
