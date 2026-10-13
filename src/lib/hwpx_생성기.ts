/**
 * 한컴 표준 규격 HWPX 문서 생성기 (순수 클라이언트/Node.js 실행 지원)
 * ============================================================================
 * - Vercel Serverless 및 클라이언트 브라우저 100% 호환 (Python 불필요)
 * - 한컴오피스 한글 2014~2024 완벽 호환 (application/hwp+zip)
 * ============================================================================
 */
import JSZip from 'jszip';
import {
  HWPX_CONTAINER_XML,
  HWPX_SETTINGS_XML,
  HWPX_VERSION_XML,
  HWPX_HEADER_XML,
} from './hwpx_표준_템플릿';

function escapeXml(text: string): string {
  return text
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

function buildSection0Xml(title: string, rawText: string): string {
  let paraIdCounter = 1000000001;

  // 1. 섹션 헤더 및 여백 설정 문단
  const secPrPara = `  <hp:p id="${paraIdCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
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

  // 2. 제목 문단
  const titlePara = `  <hp:p id="${paraIdCounter++}" paraPrIDRef="28" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="7">
      <hp:t>${escapeXml(title)}</hp:t>
    </hp:run>
  </hp:p>
  <hp:p id="${paraIdCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>`;

  // 3. 본문 문단들 조립
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const bodyParas: string[] = [];

  for (const line of lines) {
    // 이미 타이틀과 동일한 문구는 중복 방지
    if (line === title) continue;

    if (
      line.startsWith('■') ||
      line.startsWith('●') ||
      /^[1-5]\.\s/.test(line) ||
      line.includes('【종합 진단')
    ) {
      // 대제목 (Heading 1) - 빈 줄 추가 후 제목 문단
      bodyParas.push(`  <hp:p id="${paraIdCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>`);
      bodyParas.push(`  <hp:p id="${paraIdCounter++}" paraPrIDRef="29" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="8">
      <hp:t>${escapeXml(line)}</hp:t>
    </hp:run>
  </hp:p>`);
    } else if (
      line.startsWith('◆') ||
      line.startsWith('▶') ||
      line.startsWith('▷') ||
      /^[가-다]\.\s/.test(line)
    ) {
      // 소제목 (Heading 2)
      bodyParas.push(`  <hp:p id="${paraIdCounter++}" paraPrIDRef="29" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="9">
      <hp:t>${escapeXml(line)}</hp:t>
    </hp:run>
  </hp:p>`);
    } else {
      // 일반 본문
      bodyParas.push(`  <hp:p id="${paraIdCounter++}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:t>${escapeXml(line)}</hp:t>
    </hp:run>
  </hp:p>`);
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
export async function generateHwpxBlob(title: string, rawText: string): Promise<Blob> {
  const zip = new JSZip();

  // ★ 한컴오피스 규격 필수: mimetype 은 압축 없이(STORE), ZIP의 맨 첫 번째 항목이어야 함!
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', HWPX_CONTAINER_XML);
  zip.file('settings.xml', HWPX_SETTINGS_XML);
  zip.file('version.xml', HWPX_VERSION_XML);
  zip.file('Contents/header.xml', HWPX_HEADER_XML);
  zip.file('Contents/content.hpf', buildContentHpf(title));
  zip.file('Contents/section0.xml', buildSection0Xml(title, rawText));

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
  rawText: string,
  fileName: string
): Promise<void> {
  const blob = await generateHwpxBlob(title, rawText);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
