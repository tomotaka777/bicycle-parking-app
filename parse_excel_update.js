/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const ExcelJS = require('exceljs');
async function run() {
  const url = 'https://docs.google.com/spreadsheets/d/1Q_QFVssWHveTQmJbU9m7mqYodM92JDjhltWgoY6UBNU/export?format=xlsx';
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(buffer));
  const sheet = workbook.worksheets[4]; // ���֏�}�X�^�[
  
  const updates = [];
  // Rows 10 to 22
  for (let i = 10; i <= 22; i++) {
    const row = sheet.getRow(i);
    const id = row.getCell(1).value;
    const name = row.getCell(2).value;
    const latlng = row.getCell(4).value;
    if (id && ![14, 15, 17].includes(i)) { // exclude 14, 15, 17 as instructed
      updates.push({ id, name, latlng });
    }
  }
  console.log(JSON.stringify(updates, null, 2));
}
run().catch(console.error);
