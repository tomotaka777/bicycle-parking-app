/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const fs = require('fs');
const xlsx = require('xlsx');

async function run() {
  const fileId = '1Q_QFVssWHveTQmJbU9m7mqYodM92JDjhltWgoY6UBNU';
  const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const wb = xlsx.read(buffer, {type: 'array'});
  const sheet = wb.Sheets['駐輪場マスター'];
  const rows = xlsx.utils.sheet_to_json(sheet, {header: 'A'});
  
  const fees = {};
  for (const row of rows) {
    const id = row['A'];
    const fee = row['C'];
    if (id && typeof id === 'string' && fee) {
      fees[id] = fee.toString();
    }
  }
  
  const jsonPath = './data/osaka_lots.json';
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updatedCount = 0;
  for (const lot of data) {
    if (fees[lot.id]) {
      lot.fee = fees[lot.id];
      updatedCount++;
    }
  }
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log('Updated', updatedCount, 'parking lots with fees.');
}
run();
