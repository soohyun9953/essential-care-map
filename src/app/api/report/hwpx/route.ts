/**
 * POST /api/report/hwpx
 * ============================================================
 * 의료기관 프로파일 진단보고서 → HWPX 변환 API
 *
 * Request Body (JSON):
 *  {
 *    title: string;          // 문서 제목
 *    fileName: string;       // 다운로드 파일명 (*.hwpx)
 *    markdownContent: string; // 보고서 마크다운 본문
 *  }
 *
 * Response:
 *  Content-Type: application/haansofthwp
 *  Body: .hwpx 바이너리
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const ONE_SHOT_PY = 'C:/Users/KITC/.gemini/config/skills/hwpx/scripts/one_shot.py';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let tmpDir: string | null = null;

  try {
    const body = await req.json() as {
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

    // 임시 디렉토리 생성
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hwpx-'));
    const specPath = path.join(tmpDir, 'spec.json');
    const outPath = path.join(tmpDir, fileName);
    const reportPath = path.join(tmpDir, 'quality.json');

    // rawText를 깔끔한 구조적 마크다운으로 변환
    const cleanMarkdown = formatRawTextToMarkdown(title, markdownContent);

    // one_shot.py 명세 JSON 작성 (표준 보고서 스타일)
    const spec = {
      version: 1,
      kind: 'markdown',
      output: outPath,
      template: 'report',
      markdown: cleanMarkdown,
      metadata_date: new Date().toISOString().slice(0, 10),
      quality: {
        hancom: 'off',
        reject_placeholders: false,
      },
    };

    await fs.writeFile(specPath, JSON.stringify(spec, null, 2), 'utf-8');

    // Python one_shot.py 실행
    const result = await runPython(ONE_SHOT_PY, [specPath, '--report', reportPath]);

    if (result.exitCode !== 0) {
      console.error('[hwpx API] one_shot.py 오류:', result.stderr);
      return NextResponse.json(
        { error: 'HWPX 생성 실패', detail: result.stderr.slice(-800) },
        { status: 500 }
      );
    }

    // 결과 파일 읽기
    const hwpxBuffer = await fs.readFile(outPath);

    return new NextResponse(hwpxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/haansofthwp',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': String(hwpxBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[hwpx API] 예외:', err);
    return NextResponse.json({ error: 'Internal Server Error', detail: String(err) }, { status: 500 });
  } finally {
    // 임시 파일 정리
    if (tmpDir) {
      fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

// ─── Python 실행 헬퍼 ─────────────────────────────────────────
function runPython(
  scriptPath: string,
  args: string[]
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn('python', [scriptPath, ...args], {
      shell: false,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString('utf-8'); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString('utf-8'); });

    proc.on('close', (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });

    // 30초 타임아웃
    setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({ exitCode: 1, stdout, stderr: stderr + '\n[TIMEOUT]' });
    }, 30000);
  });
}

// ─── RawText → 구조적 Markdown 변환 ─────────────────────────────
function formatRawTextToMarkdown(title: string, raw: string): string {
  if (raw.includes('# ')) {
    return raw;
  }

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const out: string[] = [`# ${title}`, ''];

  for (const line of lines) {
    if (
      line.startsWith('■') ||
      line.startsWith('●') ||
      /^[1-5]\.\s/.test(line) ||
      line.includes('【종합 진단')
    ) {
      out.push(`\n## ${line}\n`);
    } else if (
      line.startsWith('◆') ||
      line.startsWith('▶') ||
      line.startsWith('▷') ||
      line.startsWith('가.') ||
      line.startsWith('나.') ||
      line.startsWith('다.')
    ) {
      out.push(`\n### ${line}\n`);
    } else if (line.startsWith('·') || line.startsWith('-') || line.startsWith('○')) {
      out.push(`- ${line.replace(/^[·\-○]\s*/, '')}`);
    } else if (line.includes('{LLM 해석}')) {
      out.push(`\n> **${line}**\n`);
    } else {
      out.push(line);
    }
  }

  return out.join('\n');
}
