/**
 * HWPX(한컴오피스 한글 표준 포맷) 사업계획서 자동 빌더 및 브라우저 다운로더
 * 
 * - OWPML (Open Word-Processor Markup Language) 표준 명세 준수
 * - 지자체 공문서 작성 규칙 및 보건복지부 취약지 공모 양식 반영 (헤더바, 소제목 뱃지, 정형 통계 표)
 * - 1~4단계 실데이터(공공병원, 환자 유출입 OD, 331개 지표정의 RAG) 자동 조립
 * - JSZip 무결점 압축 (mimetype STORE 보장)
 */

import JSZip from 'jszip';
import { 필수의료_진단_결과, 지역_평균_통계, 사업계획서_서술문_패키지 } from './필수의료_타입';
import { 공공의료기관_정보 } from './공공의료기관_데이터셋';
import { 시군구_환자_유출입_데이터 } from './환자_유출입_데이터셋';
import { 공모_분야_정보, AI_사업계획서_생성_결과 } from './사업계획서_AI_엔진';
import { format_number_comma } from './유틸리티';
import {
  HWPX_MIMETYPE,
  HWPX_VERSION_XML,
  HWPX_CONTAINER_XML,
  HWPX_CONTENT_HPF,
  HWPX_SETTINGS_XML,
  HWPX_PROPOSAL_HEADER_XML,
} from './hwpx_템플릿_상수';

export interface HWPX_사업계획서_입력 {
  region: 필수의료_진단_결과;
  sido_stat?: 지역_평균_통계;
  national_stat?: 지역_평균_통계;
  domain_info: 공모_분야_정보;
  public_hospital?: 공공의료기관_정보 | null;
  patient_flow?: 시군구_환자_유출입_데이터 | null;
  ai_result?: AI_사업계획서_생성_결과 | null;
  default_narrative?: 사업계획서_서술문_패키지;
}

// XML 특수문자 이스케이프
function escape_xml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 2025 개정 공문서 및 보건복지부 표준 서식 section0.xml 빌더
 */
export function build_proposal_section0_xml(input: HWPX_사업계획서_입력): string {
  const { region, domain_info, public_hospital, patient_flow, ai_result } = input;
  let p_id_counter = 1000000000;
  const get_next_p_id = () => (++p_id_counter).toString();

  // 최다 유출지 및 유입지 데이터
  const top_outflow = patient_flow?.outflow_top.find((x) => !x.is_self) || patient_flow?.outflow_top[0];
  const top_inflow = patient_flow?.inflow_top.find((x) => !x.is_self) || patient_flow?.inflow_top[0];
  // 유출입 자료가 없으면 다른 지역 수치로 대체하지 않고 '자료 없음'으로 명시
  const ri_str = patient_flow ? `${patient_flow.ri}%` : '자료 없음';

  // 예산·국비 비율은 공모 지침마다 달라 플랫폼이 산출하지 않음 (직접 기재 칸으로 출력)
  const 직접기재 = '○○ (직접 기재)';

  let xml = `<?xml version='1.0' encoding='UTF-8'?>
<hs:sec xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section">
  <!-- 1. 페이지 여백 및 섹션 속성 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
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
        <hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
          <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
        </hp:pageBorderFill>
      </hp:secPr>
      <hp:ctrl>
        <hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/>
      </hp:ctrl>
    </hp:run>
    <hp:run charPrIDRef="0"><hp:t/></hp:run>
  </hp:p>

  <!-- 2. 공문서 메인 헤더 타이틀 배너 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="1" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="3400" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}">
                <hp:run charPrIDRef="7"><hp:t>[공모 신청서] ${region.시도명} ${region.시군구명} ${escape_xml(domain_info.label)} 사업계획서</hp:t></hp:run>
              </hp:p>
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}">
                <hp:run charPrIDRef="4"><hp:t>- 보건복지부·국립중앙의료원 공공보건의료 취약지 거점의료기관 기능보강 국고보조사업 -</hp:t></hp:run>
              </hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/>
            <hp:cellSpan colSpan="1" rowSpan="1"/>
            <hp:cellSz width="42520" height="3400"/>
            <hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <!-- 빈 줄 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- ============================================================== -->
  <!-- Ⅰ. 사업 신청 개요 (대제목 헤더바) -->
  <!-- ============================================================== -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2800" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="5">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}">
                <hp:run charPrIDRef="10"><hp:t>Ⅰ</hp:t></hp:run>
              </hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="3200" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="6">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}">
                <hp:run charPrIDRef="8"><hp:t>  사업 신청 개요</hp:t></hp:run>
              </hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="39320" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- 개요 요약 표 (Table 1: 4열 x 4행) -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="4" colCnt="4" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="8800" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>

        <!-- 1행: 신청 지자체 / 취약등급 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>신청 지자체</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${region.시도명} ${region.시군구명}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>종합 취약등급</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${region.종합_취약도_등급} (${region.종합_취약도_점수}점)</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>

        <!-- 2행: 책임공공병원 / 신청 분야 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>책임공공의료기관</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${public_hospital ? public_hospital.기관명 : '관내 공공병원(의료원)'}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>지원 공모분야</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${escape_xml(domain_info.label)}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>

        <!-- 3행: 총 사업비 / 국비 신청액 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>총 소요사업비</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${직접기재}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>국비 신청액</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${직접기재}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>

        <!-- 4행: 지방비 매칭액 / 핵심 목표 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>지방비 매칭액</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${직접기재}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>자체충족률(RI) 목표</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>현행 ${ri_str} ➔ ○○% (목표 직접 설정)</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12260" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <!-- 빈 줄 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- ============================================================== -->
  <!-- Ⅱ. 지역 현황 및 추진 필요성 분석 (대제목 헤더바) -->
  <!-- ============================================================== -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2800" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="5">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="10"><hp:t>Ⅱ</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="3200" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="6">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="8"><hp:t>  지역 현황 및 추진 필요성 분석</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="39320" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- 소제목 1: 2024년 환자 의료이용 유출입(OD Matrix) 실태 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2400" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="7">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="11"><hp:t>1</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="2200" height="2400"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="8">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="8"><hp:t>  2024년 환자 의료이용 유출입(OD Matrix) 실태 진단</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="40320" height="2400"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>${
      patient_flow
        ? `  □ 관내 거주 주민의 총 입원 의료이용량은 ${format_number_comma(patient_flow.total_days)}일(재원)이며, 이 중 관외 유출률은 ${patient_flow.outflow_rate}%에 달하여 심각한 환자 유출 현상이 발생하고 있음.`
        : `  □ 해당 지역의 2024년 환자 유출입(재원일수) 자료가 내장 데이터에 없어 정량 분석을 생략함. (자료 확보 후 보완 필요)`
    }</hp:t></hp:run>
  </hp:p>${
    top_outflow
      ? `
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 최다 유출 지역은 ${top_outflow.dest_sido} ${top_outflow.dest_sgg}으로 전체의 ${top_outflow.pct}%(${format_number_comma(top_outflow.days)}일)를 차지하며, 상급종합 및 종합병원급 필수 인프라 부족으로 인한 원정 진료 의존도가 극심함.</hp:t></hp:run>
  </hp:p>`
      : ''
  }${
    top_inflow
      ? `
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 반면, 관내 거점의료기관은 인근 취약지인 ${top_inflow.orig_sgg}(${top_inflow.pct}%, ${format_number_comma(top_inflow.days)}일) 등의 환자를 지속적으로 수용하며 지역 배후 거점의 안전망 기능을 실질적으로 분담하고 있음.</hp:t></hp:run>
  </hp:p>`
      : ''
  }

  <!-- 유출 상위 5대 경로 표 (Table 2: 5열 x 6행) -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="6" colCnt="5" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="13200" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <!-- 표 헤더 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>구분</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="6000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>치료 대상 지역</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>입원 재원일수</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>점유율(%)</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="7000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>특성 및 비고</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>

        <!-- 상위 5개 유출 경로 데이터 행 -->
        ${(patient_flow?.outflow_top || []).slice(0, 5).map((dest, idx) => `
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${dest.is_self ? '관내진료' : `${idx}위`}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="${idx + 1}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="6000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${dest.dest_sido} ${dest.dest_sgg}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="${idx + 1}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="12000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${format_number_comma(dest.days)}일</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="${idx + 1}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="9520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${dest.pct}%</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="${idx + 1}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="7000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>${dest.is_self ? '자체충족' : '관외원정'}</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="${idx + 1}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
        `).join('')}
      </hp:tbl>
    </hp:run>
  </hp:p>

  <!-- 빈 줄 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- 소제목 2: 331개 헬스맵 지표 및 심평원 DB 기반 취약성 분석 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2400" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="7">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="11"><hp:t>2</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="2200" height="2400"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="8">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="8"><hp:t>  보건복지부 331개 헬스맵 지표 및 공공의료 인프라 취약성</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="40320" height="2400"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  □ 국가 헬스맵 지표정의서 기준 핵심 지표 코드 [${domain_info.primary_indicator_code}] 매핑 결과:</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 응급의료 60분 이내 미도달 인구비율: ${region.응급_60분_미도달_인구비율.toFixed(1)}% (응급의료취약지 선정 기준 30% ${region.응급_60분_미도달_인구비율 >= 30 ? '이상' : '미만'}, 헬스맵 2024)</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 관내 응급의료 자체충족률(RI): ${region.관내_응급_의료이용률.toFixed(1)}% / 인구수 ${format_number_comma(region.인구수)}명 (헬스맵 2024)</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ ${public_hospital ? public_hospital.기관명 : '공공병원'}의 시설·장비·인력 현황과 한계를 기재 (직접 작성).</hp:t></hp:run>
  </hp:p>

  <!-- 빈 줄 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- ============================================================== -->
  <!-- Ⅲ. 세부 사업 추진 계획 (대제목 헤더바) -->
  <!-- ============================================================== -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2800" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="5">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="10"><hp:t>Ⅲ</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="3200" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="6">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="8"><hp:t>  세부 사업 추진 계획</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="39320" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- 세부 추진 내용 본문 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  □ 사업 목표: ${region.시군구명} 내 필수보건의료 거점센터 구축 및 원정진료 부담 해소</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 1단계: ${public_hospital ? public_hospital.기관명 : '지역 공공병원'} 내 전담 시설 리모델링 및 음압·클린룸 확충</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 2단계: 최첨단 필수 의료장비 도입 (혈액투석기, 초음파 및 모니터링 시스템 일체)</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 3단계: 국립대병원 공공임상교수 파견 연계 및 전문 간호인력 확충을 통한 24시간 상시 가동체계 확립</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 4단계: 119 구급대-책임의료원 간 실시간 병상 정보 연계 핫라인(E-Gen 기반) 구축</hp:t></hp:run>
  </hp:p>

  <!-- 빈 줄 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- ============================================================== -->
  <!-- Ⅳ. 소요예산 및 재원조달 방안 (대제목 헤더바) -->
  <!-- ============================================================== -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2800" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="5">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="10"><hp:t>Ⅳ</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="3200" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="6">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="8"><hp:t>  소요예산 및 재원조달 방안</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="39320" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- 예산 편성 상세표 (Table 3: 5열 x 5행) -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="5" colCnt="5" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="11000" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <!-- 헤더 행 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>비목 구분</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="10000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>총사업비(백만원)</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>국비</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>지방비</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>산출 내역</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
        <!-- 시설비 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>시설현대화 및 리모델링</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="10000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>규모 직접 기재</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="1"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
        <!-- 장비비 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>필수 첨단 의료장비</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="10000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>품목·수량 직접 기재</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="2"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
        <!-- 인력 및 운영비 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>전문의료인력 및 전원망</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="10000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="1"><hp:t>인력·연계망 직접 기재</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="3"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
        <!-- 합계 -->
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>합  계</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="4"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="10000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="4"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8520" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="2" rowAddr="4"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>○○</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="3" rowAddr="4"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="9"><hp:t>분담 비율은 공모 지침 확인</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="4" rowAddr="4"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="8000" height="2200"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <!-- 빈 줄 -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>

  <!-- ============================================================== -->
  <!-- Ⅴ. 기대효과 및 향후 성과지표 (대제목 헤더바) -->
  <!-- ============================================================== -->
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="${get_next_p_id()}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="0" rowCnt="1" colCnt="2" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="42520" widthRelTo="ABSOLUTE" height="2800" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="0" right="0" top="0" bottom="0"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="5">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="21" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="10"><hp:t>Ⅴ</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="3200" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="6">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              <hp:p paraPrIDRef="22" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="${get_next_p_id()}"><hp:run charPrIDRef="8"><hp:t>  기대효과 및 향후 성과지표</hp:t></hp:run></hp:p>
            </hp:subList>
            <hp:cellAddr colAddr="1" rowAddr="0"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="39320" height="2800"/><hp:cellMargin left="0" right="0" top="0" bottom="0"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
  </hp:p>

  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t/></hp:run></hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  □ 정량적 기대효과 및 목표 지표 달성 계획</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 관내 자체충족률(RI): 현행 ${ri_str} ➔ 사업 완료 시 ○○% 이상 (목표 직접 설정)</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  ○ 응급 60분 미도달 인구비율: 현행 ${region.응급_60분_미도달_인구비율.toFixed(1)}% ➔ ○○% (목표 직접 설정)</hp:t></hp:run>
  </hp:p>
  <hp:p id="${get_next_p_id()}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="1"><hp:t>  □ 정성적 기대효과: 의료격차 해소를 통한 군민 거주안정성 증대 및 지방소멸 방어 효과</hp:t></hp:run>
  </hp:p>

</hs:sec>`;

  return xml;
}

/**
 * JSZip을 활용하여 OWPML 규격의 무결점 HWPX Blob 패키지 생성
 */
export async function generate_hwpx_blob(input: HWPX_사업계획서_입력): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (★중요: HWPX 표준 스펙상 무압축 STORE여야 함)
  zip.file('mimetype', HWPX_MIMETYPE, { compression: 'STORE' });

  // 2. 루트 메타데이터 파일들
  zip.file('version.xml', HWPX_VERSION_XML);
  zip.file('settings.xml', HWPX_SETTINGS_XML);

  // 3. META-INF 컨테이너 매니페스트
  zip.folder('META-INF')?.file('container.xml', HWPX_CONTAINER_XML);

  // 4. Contents 폴더 (content.hpf, header.xml, section0.xml)
  const contents = zip.folder('Contents');
  if (contents) {
    contents.file('content.hpf', HWPX_CONTENT_HPF);
    contents.file('header.xml', HWPX_PROPOSAL_HEADER_XML);
    contents.file('section0.xml', build_proposal_section0_xml(input));
  }

  // 5. 바이너리 압축 생성 (application/hwp+zip)
  return await zip.generateAsync({
    type: 'blob',
    mimeType: HWPX_MIMETYPE,
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * 브라우저 원클릭 파일 다운로드 트리거 함수
 */
export async function download_hwpx_plan_file(
  input: HWPX_사업계획서_입력,
  filename?: string
): Promise<void> {
  const blob = await generate_hwpx_blob(input);
  const default_name = `${input.region.시도명}_${input.region.시군구명}_${input.domain_info.id}_사업계획서_공공표준.hwpx`;
  const target_filename = filename || default_name;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = target_filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
