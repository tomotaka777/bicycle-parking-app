/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const ExcelJS = require('exceljs'); async function run() { const url = 'https://docs.google.com/spreadsheets/d/1Q_QFVssWHveTQmJbU9m7mqYodM92JDjhltWgoY6UBNU/export?format=xlsx'; const res = await fetch(url); const buffer = await res.arrayBuffer(); const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(Buffer.from(buffer)); const sheet = workbook.worksheets[4]; sheet.eachRow((row, rowNumber) => { const cell = row.getCell(1); if (cell.value) { const colorStr = cell.font && cell.font.color ? JSON.stringify(cell.font.color) : ''; if (colorStr && colorStr.indexOf('theme') === -1) { let val = cell.value; if (val.richText) val = val.richText.map(rt => rt.text).join(''); console.log(rowNumber, val, colorStr); } } }); } run();
