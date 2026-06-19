const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ok230176\\.gemini\\antigravity\\brain\\8a29b90e-96b8-4f37-92a5-1821c3db3af7\\.system_generated\\steps\\31\\content.md', 'utf-8');

const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/g;
let match;
while ((match = scriptRegex.exec(content)) !== null) {
  if (match[1].includes('var data = [') || match[1].includes('const data = [') || match[1].includes('let data = [')) {
    console.log('Found data array in script!');
    console.log(match[1].substring(0, 1000));
  }
}

// Alternatively, let's search for the line `data[` or `data =` in the HTML.
const lines = content.split('\n');
const dataLines = lines.filter(line => line.includes('var data =') || line.includes('let data =') || line.includes('const data ='));
if (dataLines.length > 0) {
    console.log('Data declaration:', dataLines[0].substring(0, 500));
}

// What if the data is fetched dynamically? Let's check for $.ajax, fetch, $.getJSON
const fetchLines = lines.filter(line => line.includes('$.ajax') || line.includes('fetch(') || line.includes('$.getJSON(') || line.includes('XMLHttpRequest'));
console.log('Fetch lines:', fetchLines.slice(0, 10));

