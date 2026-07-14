/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const fs = require('fs');
const filePath = './data/osaka_lots.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const targetIds = ['arc_54_1', 'arc_54_2', 'arc_54_3', 'arc_54_4', 'arc_55_5', 'arc_56_2', 'arc_56_5', 'arc_57_1', 'arc_57_2', 'arc_57_3'];

data.forEach(lot => {
  if (targetIds.includes(lot.id)) {
    const oldName = lot.name;
    lot.name = lot.name
      .replace(/ [a-zA-Z]+_[0-9]+.*/g, '')
      .replace(/ \/ .*$/g, '')
      .replace(/ \(.*\)$/g, '');
    console.log(oldName + ' -> ' + lot.name);
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
