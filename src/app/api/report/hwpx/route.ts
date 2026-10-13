/**
 * POST /api/report/hwpx
 * ============================================================
 * 의료기관 프로파일 진단보고서 → HWPX 변환 API
 * - Vercel Serverless (Node.js) 100% 호환 (Python 불필요)
 * - JSZip 기반 한컴 표준 HWPX 바이너리 직접 생성
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateHwpxBlob } from '@/lib/hwpx_생성기';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as {
      title?: string;
      fileName?: string;
      markdownContent?: string;
    };

    const title = body.title ?? '의료기관 프로파일 진단보고서';
    const fileName = (body.fileName ?? '진단보고서.hwpx').replace(/[/\\:*?"<>|]/g, '_');
    const markdownContent = body.markdownContent ?? '';

    if (!markdownContent.trim()) {
      return NextResponse.json({ error: '보고서 내용이 비어 있습니다.' }, { status: 400 });
    }

    // 순수 JS/TS 기반으로 한컴 표준 HWPX 생성 (Vercel 호환)
    const blob = await generateHwpxBlob(title, markdownContent);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/hwp+zip',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[hwpx API 예외]', err);
    return NextResponse.json(
      { error: 'HWPX 생성 실패', detail: String(err) },
      { status: 500 }
    );
  }
}
