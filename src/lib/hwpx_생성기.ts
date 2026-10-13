/**
 * 한컴 표준 규격 HWPX 문서 생성기 (순수 클라이언트/Node.js 실행 지원)
 * ============================================================================
 * - Vercel Serverless 및 클라이언트 브라우저 100% 호환 (Python 불필요)
 * - 한컴오피스 한글 2014~2024 완벽 호환 (application/hwp+zip)
 * - 정규 한컴 표(<hp:tbl>), 제목, 문단, 소견 박스 정밀 렌더링 지원
 * ============================================================================
 */
import JSZip from 'jszip';
import {
  HWPX_CONTAINER_XML,
  HWPX_SETTINGS_XML,
  HWPX_VERSION_XML,
  HWPX_HEADER_XML,
} from './hwpx_표준_템플릿';

export interface HwpxTable {
  headers: string[];
  rows: string[][];
  colWidths?: number[]; // 단위: HWPUNIT (전체 42520 기준)
  alignments?: ('left' | 'center' | 'right')[];
}

export type ReportItem =
  | { type: 'heading1'; text: string } // 대제목 (14pt 볼드, charPr="8", paraPr="29")
  | { type: 'heading2'; text: string } // 중제목 (12pt 볼드, charPr="13", paraPr="29")
  | { type: 'heading3'; text: string } // 소제목 (10pt 볼드, charPr="9", paraPr="0")
  | { type: 'paragraph'; text: string } // 일반 본문 (10pt 바탕, charPr="0", paraPr="0")
  | { type: 'bullet'; text: string } // 개조식 항목 (10pt 바탕, paraPr="0")
  | { type: 'box'; title?: string; text: string } // 진단 소견 블록
  | { type: 'table'; table: HwpxTable } // 정규 표
  | { type: 'spacer' }; // 빈 줄

function escapeXml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildContentHpf(title: string): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const isoStr = now.toISOString();

  return `<?xml version='1.0' encoding='UTF-8'?>
<opf:package xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf/" xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0" version="" unique-identifier="" id="">
  <opf:metadata>
    <opf:title>${escapeXml(title)}</opf:title>
    <opf:language>ko</opf:language>
    <opf:meta name="creator" content="공공의료 AI 분석 시스템"/>
    <opf:meta name="subject" content="의료기관 프로파일 진단보고서"/>
    <opf:meta name="description" content="5종 표준 진단보고서 자동 생성 문서"/>
    <opf:meta name="lastsaveby" content="공공의료 AI 분석 시스템"/>
    <opf:meta name="CreatedDate" content="text">${isoStr}</opf:meta>
    <opf:meta name="ModifiedDate" content="text">${isoStr}</opf:meta>
    <opf:meta name="date" content="text">${dateStr}</opf:meta>
    <opf:meta name="keyword" content="공공의료,진단보고서,의료기관프로파일"/>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
    <opf:item id="settings" href="settings.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="yes"/>
    <opf:itemref idref="section0" linear="yes"/>
  </opf:spine>
</opf:package>`;
}

/**
 * 한컴오피스 정규 테이블 XML 생성
 */
function renderTableXml(table: HwpxTable, counter: { nextId: () => number }): string {
  const numCols = Math.max(table.headers.length, 1);
  const numRows = 1 + table.rows.length;
  const bodyWidth = 42520; // 59528 - 2 * 8504 (A4 용지 기본 본문 너비)
  const defaultColWidth = Math.floor(bodyWidth / numCols);

  const colWidths = table.colWidths && table.colWidths.length === numCols
    ? [...table.colWidths]
    : Array(numCols).fill(defaultColWidth);

  // 너비 오차 보정
  const sumWidths = colWidths.reduce((a, b) => a + b, 0);
  if (sumWidths !== bodyWidth) {
    colWidths[numCols - 1] += (bodyWidth - sumWidths);
  }

  const rowHeight = 2400; // HWPUNIT
  const totalHeight = rowHeight * numRows;
  const tblId = counter.nextId();
  const pid = counter.nextId();

  const makeCell = (text: string, isHeader: boolean, colIdx: number, rowIdx: number) => {
    const bf = isHeader ? '4' : '3'; // 4: 배경 채우기 #DAEEF3, 3: 기본 실선
    const charPr = isHeader ? '9' : '0'; // 9: 볼드, 0: 기본
    let paraPr = isHeader ? '21' : '22'; // 21: 표 헤더 가운데, 22: 표 본문 가운데
    if (!isHeader && table.alignments && table.alignments[colIdx] === 'left') {
      paraPr = '0'; // 왼쪽 정렬
    }
    const cellPid = counter.nextId();

    return `        <hp:tc name="" header="${isHeader ? 1 : 0}" hasMargin="1" protect="0" editable="0" dirty="1" borderFillIDRef="${bf}">
          <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
            <hp:p paraPrIDRef="${paraPr}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${cellPid}">
              <hp:run charPrIDRef="${charPr}"><hp:t>${escapeXml(text)}</hp:t></hp:run>
            </hp:p>
          </hp:subList>
          <hp:cellAddr colAddr="${colIdx}" rowAddr="${rowIdx}"/>
          <hp:cellSpan colSpan="1" rowSpan="1"/>
          <hp:cellSz width="${colWidths[colIdx]}" height="${rowHeight}"/>
          <hp:cellMargin left="340" right="340" top="140" bottom="140"/>
        </hp:tc>`;
  };

  const headerCells = table.headers.map((h, i) => makeCell(h, true, i, 0)).join('\n');
  const headerRow = `      <hp:tr>\n${headerCells}\n      </hp:tr>`;

  const dataRows = table.rows.map((row, ri) => {
    const padded = [...row];
    while (padded.length < numCols) padded.push('');
    const cells = padded.slice(0, numCols).map((val, ci) => makeCell(val, false, ci, ri + 1)).join('\n');
    return `      <hp:tr>\n${cells}\n      </hp:tr>`;
  }).join('\n');

  return `  <hp:p id="${pid}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${tblId}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="${numRows}" colCnt="${numCols}" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="${bodyWidth}" widthRelTo="ABSOLUTE" height="${totalHeight}" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
${headerRow}
${dataRows}
      </hp:tbl>
    </hp:run>
  </hp:p>
  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>`;
}

/**
 * 마크다운 또는 텍스트에서 ReportItem 배열로 파싱
 */
export function parseRawTextToItems(rawText: string): ReportItem[] {
  const lines = rawText.split('\n').map((l) => l.trim());
  const items: ReportItem[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line) {
      i++;
      continue;
    }

    // 마크다운 표 감지 (| 로 시작하고 | 로 끝남)
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|') && lines[i].endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // 구분선(|---|---|) 건너뛰기
        const startDataIdx = tableLines[1].includes('---') ? 2 : 1;
        const rows: string[][] = [];

        for (let r = startDataIdx; r < tableLines.length; r++) {
          const cells = tableLines[r]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          rows.push(cells);
        }

        items.push({
          type: 'table',
          table: {
            headers: rawHeaders,
            rows,
          },
        });
        continue;
      }
    }

    // 대제목: ■, ●, 1. , 또는 ###
    if (
      line.startsWith('■') ||
      line.startsWith('●') ||
      /^#{1,2}\s/.test(line) ||
      /^[1-5]\.\s/.test(line) ||
      line.includes('【종합 진단')
    ) {
      const cleanText = line.replace(/^#{1,2}\s*/, '');
      items.push({ type: 'spacer' });
      items.push({ type: 'heading1', text: cleanText });
      i++;
      continue;
    }

    // 중제목: ▶, ◆, ▷, 가. , 또는 ###
    if (
      line.startsWith('▶') ||
      line.startsWith('◆') ||
      line.startsWith('▷') ||
      /^#{3}\s/.test(line) ||
      /^[가-다]\.\s/.test(line)
    ) {
      const cleanText = line.replace(/^#{3}\s*/, '');
      items.push({ type: 'heading2', text: cleanText });
      i++;
      continue;
    }

    // 소제목: 1), 가), [진단 소견] 등
    if (
      line.startsWith('• ') ||
      line.startsWith('- ') ||
      line.startsWith('* ')
    ) {
      const cleanText = line.replace(/^[-*•]\s*/, '');
      items.push({ type: 'bullet', text: `• ${cleanText}` });
      i++;
      continue;
    }

    // 일반 본문
    items.push({ type: 'paragraph', text: line });
    i++;
  }

  return items;
}

/**
 * ReportItem 배열로부터 완성된 section0.xml 조립
 */
export function buildSection0FromItems(title: string, items: ReportItem[]): string {
  let paraIdCounter = 1000000001;
  const counter = {
    nextId: () => paraIdCounter++,
  };

  // 1. 섹션 헤더 및 여백 설정 문단
  const secPrPara = `  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">
        <hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>
        <hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>
        <hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>
        <hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/>
        <hp:pagePr landscape="WIDELY" width="59528" height="84186" gutterType="LEFT_ONLY">
          <hp:margin header="4252" footer="4252" gutter="0" left="8504" right="8504" top="5668" bottom="4252"/>
        </hp:pagePr>
        <hp:footNotePr>
          <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
          <hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/>
          <hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/>
          <hp:numbering type="CONTINUOUS" newNum="1"/>
          <hp:placement place="EACH_COLUMN" beneathText="0"/>
        </hp:footNotePr>
        <hp:endNotePr>
          <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
          <hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/>
          <hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/>
          <hp:numbering type="CONTINUOUS" newNum="1"/>
          <hp:placement place="END_OF_DOCUMENT" beneathText="0"/>
        </hp:endNotePr>
        <hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
        <hp:pageBorderFill type="EVEN" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
        <hp:pageBorderFill type="ODD" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
      </hp:secPr>
      <hp:ctrl>
        <hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/>
      </hp:ctrl>
    </hp:run>
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>`;

  // 2. 문서 대제목 (20pt 볼드, 가운데 정렬)
  const titlePara = `  <hp:p id="${counter.nextId()}" paraPrIDRef="20" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="7">
      <hp:t>${escapeXml(title)}</hp:t>
    </hp:run>
  </hp:p>
  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>`;

  // 3. 본문 조립
  const bodyParas: string[] = [];

  for (const item of items) {
    switch (item.type) {
      case 'heading1':
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="29" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="8">
      <hp:t>${escapeXml(item.text)}</hp:t>
    </hp:run>
  </hp:p>`);
        break;

      case 'heading2':
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="29" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="13">
      <hp:t>${escapeXml(item.text)}</hp:t>
    </hp:run>
  </hp:p>`);
        break;

      case 'heading3':
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="9">
      <hp:t>${escapeXml(item.text)}</hp:t>
    </hp:run>
  </hp:p>`);
        break;

      case 'paragraph':
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:t>${escapeXml(item.text)}</hp:t>
    </hp:run>
  </hp:p>`);
        break;

      case 'bullet':
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:t>${escapeXml(item.text)}</hp:t>
    </hp:run>
  </hp:p>`);
        break;

      case 'box':
        if (item.title) {
          bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="9">
      <hp:t>${escapeXml(item.title)}</hp:t>
    </hp:run>
  </hp:p>`);
        }
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="24" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:t>${escapeXml(item.text)}</hp:t>
    </hp:run>
  </hp:p>`);
        break;

      case 'table':
        bodyParas.push(renderTableXml(item.table, counter));
        break;

      case 'spacer':
        bodyParas.push(`  <hp:p id="${counter.nextId()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>`);
        break;
    }
  }

  return `<?xml version='1.0' encoding='UTF-8'?>
<hs:sec xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf/" xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0">
${secPrPara}
${titlePara}
${bodyParas.join('\n')}
</hs:sec>`;
}

/**
 * HWPX Blob 생성 (Vercel 및 브라우저 환경 100% 호환)
 */
export async function generateHwpxBlob(
  title: string,
  content: string | ReportItem[]
): Promise<Blob> {
  const items = typeof content === 'string' ? parseRawTextToItems(content) : content;
  const section0Xml = buildSection0FromItems(title, items);

  const zip = new JSZip();

  // ★ 한컴오피스 규격 필수: mimetype 은 압축 없이(STORE), ZIP의 맨 첫 번째 항목이어야 함!
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', HWPX_CONTAINER_XML);
  zip.file('settings.xml', HWPX_SETTINGS_XML);
  zip.file('version.xml', HWPX_VERSION_XML);
  zip.file('Contents/header.xml', HWPX_HEADER_XML);
  zip.file('Contents/content.hpf', buildContentHpf(title));
  zip.file('Contents/section0.xml', section0Xml);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/hwp+zip',
  });
}

/**
 * 클라이언트 브라우저에서 HWPX 다운로드 직접 실행
 */
export async function downloadHwpxDirect(
  title: string,
  content: string | ReportItem[],
  fileName: string
): Promise<void> {
  const blob = await generateHwpxBlob(title, content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
