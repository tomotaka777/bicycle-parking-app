import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing file ID', { status: 400 });
  }

  try {
    // Google Driveの直リンクURL
    const url = `https://drive.google.com/uc?export=view&id=${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse('Failed to fetch image from Google Drive', { status: response.status });
    }

    // 画像データをバッファとして取得
    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers();
    
    // コンテンツタイプをそのまま引き継ぐ（通常は image/png や image/jpeg）
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
    
    // サイネージで常に最新を取得できるよう、プロキシ側でもキャッシュを無効化
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Error proxying Google Drive image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
