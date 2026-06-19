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

    const [statusResponse, probResponse] = await Promise.all([
      fetch(statusUrl, { next: { revalidate: 15 } }),
      fetch(probUrl, { next: { revalidate: 15 } })
    ]);

    if (!statusResponse.ok) throw new Error(`Failed to fetch status Excel: ${statusResponse.statusText}`);
    if (!probResponse.ok) throw new Error(`Failed to fetch probability Excel: ${probResponse.statusText}`);

    // Parse slots
    const arrayBuffer = await statusResponse.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
    const sheetName = '最新ステータス';
    if (!workbook.SheetNames.includes(sheetName)) throw new Error(`Sheet ${sheetName} not found`);
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);
    if (data.length === 0) return NextResponse.json({ error: "Status sheet is empty" }, { status: 400 });
    const latestRow = data[data.length - 1];

    const slots: Record<string, number> = {};
    for (const [key, value] of Object.entries(latestRow)) {
      if (key !== 'Unnamed: 0' && key !== '取得日時' && typeof value === 'number') {
        slots[key] = value;
      }
    }

    // Parse probabilities from Excel
    const probArrayBuffer = await probResponse.arrayBuffer();
    const probWorkbook = xlsx.read(probArrayBuffer, { type: 'array' });
    const probSheetName = probWorkbook.SheetNames[0]; // Assume first sheet
    const probSheet = probWorkbook.Sheets[probSheetName];
    const probData: any[] = xlsx.utils.sheet_to_json(probSheet);

    const probabilities: Record<string, number> = {};
    for (const row of probData) {
      if (row['駐輪場記号'] && row['満車確率_%'] !== undefined) {
        // Parse float and convert percentage to 0.0-1.0 float
        const p = parseFloat(row['満車確率_%']);
        if (!isNaN(p)) {
          probabilities[row['駐輪場記号']] = p / 100.0;
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
