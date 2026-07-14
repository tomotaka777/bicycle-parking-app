/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const fs = require('fs');
const updates = [
  { id: 'arc_54_1', name: '��E�V��K temma_12003', latlng: '34.7043748 135.5130151' },
  { id: 'arc_54_2', name: '�V�ZQ temma_11002', latlng: '34.7114400 135.5110349' },
  { id: 'arc_54_3', name: '�V�_���ؘZ���ډw���]�Ԓ��ԏ�@�ꎞ���p3 / �V�_��6����7-5', latlng: '34.7098577 135.5108749' },
  { id: 'arc_54_4', name: '�n���S���Éw�Ǘ����֏� umeda_41004', latlng: '34.7092410 135.5108988' },
  { id: 'arc_55_5', name: '��1 dojima_43007', latlng: '34.7054515 135.5107368' },
  { id: 'arc_56_2', name: '��w�E�V���w���]�Ԓ��ԏ�@�ꎞ���p2 / �V�_��3����11-15', latlng: '34.7027706 135.5111959' },
  { id: 'arc_56_5', name: '5-B dojima_12001', latlng: '34.7054515 135.5107368' },
  { id: 'arc_57_1', name: '���V���{�E��X��L temma_14002', latlng: '34.6978438 135.5111184' },
  { id: 'arc_57_2', name: '���V���{�E��X��P temma_14003 (���V���{�w�E��X���w���]�Ԓ��ԏ�@�ꎞ���p2 ��X��2����1-29)', latlng: '34.6979638 135.5108953' },
  { id: 'arc_57_3', name: '���V���{�w�E��X���w���]�Ԓ��ԏ�@�ꎞ���p3 (��X��2����1-4)', latlng: '34.6973660 135.5113220' }
];

const filePath = './data/osaka_lots.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updatedCount = 0;
data.forEach(lot => {
  const update = updates.find(u => u.id === lot.id);
  if (update) {
    lot.name = update.name;
    if (update.latlng) {
      const parts = update.latlng.split(' ');
      if (parts.length === 2) {
        lot.lat = parseFloat(parts[0]);
        lot.lng = parseFloat(parts[1]);
      }
    }
    updatedCount++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Updated ' + updatedCount + ' lots.');

