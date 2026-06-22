import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    // 1. Fetch available slots from original spreadsheet
    const statusFileId = '1Q_QFVssWHveTQmJbU9m7mqYodM92JDjhltWgoY6UBNU';
    const statusUrl = `https://docs.google.com/spreadsheets/d/${statusFileId}/export?format=xlsx`;

    // 2. Fetch full probabilities from the official ML model spreadsheet
    const probFileId = '1TpXm7sSb1cw3gz8uBfB8L8c2I0uxWbK8s1jW_Qw9CjU';
    const probUrl = `https://docs.google.com/spreadsheets/d/${probFileId}/export?format=xlsx`;

    // 3. Fetch Osaka Tech specific latest status
    const osakaTechFileId = '1aCubfjUGDm11G1gRwMiq0zhoGaN8-GNXZ6eW9AT4pMw';
    const osakaTechUrl = `https://docs.google.com/spreadsheets/d/${osakaTechFileId}/export?format=xlsx`;

    const [statusResponse, probResponse, osakaTechResponse] = await Promise.all([
      fetch(statusUrl, { next: { revalidate: 15 } }),
      fetch(probUrl, { next: { revalidate: 15 } }),
      fetch(osakaTechUrl, { next: { revalidate: 15 } })
    ]);

    if (!statusResponse.ok) console.warn(`Failed to fetch status Excel: ${statusResponse.statusText}`);
    if (!probResponse.ok) console.warn(`Failed to fetch probability Excel: ${probResponse.statusText}`);
    if (!osakaTechResponse.ok) console.warn(`Failed to fetch Osaka Tech Excel: ${osakaTechResponse.statusText}`);

    const slots: Record<string, number> = {};
    const probabilities: Record<string, number> = {};

    // Parse slots
    if (statusResponse.ok) {
      const arrayBuffer = await statusResponse.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer, { type: 'array' });
      const sheetName = '最新ステータス';
      if (workbook.SheetNames.includes(sheetName)) {
        const sheet = workbook.Sheets[sheetName];
        const data: any[] = xlsx.utils.sheet_to_json(sheet);
        if (data.length > 0) {
          const latestRow = data[data.length - 1];
          for (const [key, value] of Object.entries(latestRow)) {
            if (key !== 'Unnamed: 0' && key !== '取得日時' && typeof value === 'number') {
              slots[key] = value;
            }
          }
        }
      }
    }

    // Parse probabilities from Excel
    if (probResponse.ok) {
      const probArrayBuffer = await probResponse.arrayBuffer();
      const probWorkbook = xlsx.read(probArrayBuffer, { type: 'array' });
      const probSheetName = probWorkbook.SheetNames[0]; // Assume first sheet
      const probSheet = probWorkbook.Sheets[probSheetName];
      const probData: any[] = xlsx.utils.sheet_to_json(probSheet);

      for (const row of probData) {
        if (row['駐輪場記号'] && row['満車確率_%'] !== undefined) {
          const p = parseFloat(row['満車確率_%']);
          if (!isNaN(p)) {
            probabilities[row['駐輪場記号']] = p / 100.0;
          }
        }
      }
    }

    // Parse Osaka Tech specific data
    if (osakaTechResponse.ok) {
      const osakaArrayBuffer = await osakaTechResponse.arrayBuffer();
      const osakaWorkbook = xlsx.read(osakaArrayBuffer, { type: 'array' });
      const osakaSheet = osakaWorkbook.Sheets[osakaWorkbook.SheetNames[0]];
      const osakaData: any[][] = xlsx.utils.sheet_to_json(osakaSheet, { header: 1 });
      
      // Data is expected to be on row 1 (index 1) since row 0 is headers
      if (osakaData.length > 1) {
        const row = osakaData[1];
        const parkedBicycles = parseInt(row[3]); // Column D
        const probability = parseFloat(row[7]); // Column H
        
        if (!isNaN(parkedBicycles)) {
          slots['osaka_tech_parked'] = parkedBicycles;
        }
        if (!isNaN(probability)) {
          probabilities['osaka_tech'] = probability / 100.0;
        }
      }
    }

    return NextResponse.json({
      slots,
      probabilities
    });

  } catch (error) {
    console.error('Error in /api/sync-status:', error);
    return NextResponse.json(
      { error: 'Failed to sync status and probabilities' },
      { status: 500 }
    );
  }
}
