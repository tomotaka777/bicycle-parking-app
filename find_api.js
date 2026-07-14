/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const https = require('https');

https.get('https://osakakitakumap.net/churinjo/viewer/viewer.js', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const jsonUrls = data.match(/https?:\/\/[^\s"'<>]+\.json/g) || [];
    const localJsonUrls = data.match(/[^\s"'<>]+\.json/g) || [];
    const endpoints = data.match(/\/churinjo\/[^\s"'<>]+/g) || [];
    console.log('JSON URLs:', Array.from(new Set(jsonUrls)));
    console.log('Local JSON URLs:', Array.from(new Set(localJsonUrls)));
    console.log('Endpoints:', Array.from(new Set(endpoints)));
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
