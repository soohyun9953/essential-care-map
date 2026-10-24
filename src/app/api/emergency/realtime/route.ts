import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import {
  공공의료_자원_서비스,
  실시간_응급실_기관정보,
} from '@/lib/공공의료_자원_서비스';
import { 서비스키_정규화, 실패_사유 } from '@/lib/공공데이터_응답_해석';

export const dynamic = 'force-dynamic';

export interface RealtimeEmergencyResponse {
  is_live_api: boolean;
  source: string;
  sido: string;
  sigungu: string;
  last_updated: string;
  /** 실시간 조회 결과 (성공·키 미등록·실패 사유). 서비스키는 담지 않는다 */
  api_status: string;
  local_hospital: 실시간_응급실_기관정보 | null;
  regional_center: 실시간_응급실_기관정보 | null;
  all_hospitals: 실시간_응급실_기관정보[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sido = searchParams.get('sido') || '강원특별자치도';
    const sigungu = searchParams.get('sigungu') || '영월군';
    const service_key = 서비스키_정규화(
      req.headers.get('x-data-go-kr-key')?.trim() || process.env.DATA_GO_KR_API_KEY || ''
    );
    let api_status = service_key ? '' : '키 미등록';

    // 배포 서버(Vercel)는 UTC이므로 한국 시간대를 명시
    const now_time_str = new Date().toLocaleTimeString('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // 1. 공공데이터포털(data.go.kr) E-Gen 실제 OpenAPI 호출 시도
    if (service_key) {
      try {
        // 국립중앙의료원 중앙응급의료센터_전국 응급의료기관 실시간 병상 정보 조회
        const api_url = `https://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire?serviceKey=${encodeURIComponent(
          service_key
        )}&STAGE1=${encodeURIComponent(sido)}&STAGE2=${encodeURIComponent(sigungu)}&pageNo=1&numOfRows=10`;

        const res = await fetch(api_url, {
          next: { revalidate: 30 }, // 30초 캐시
          headers: { Accept: 'application/json, text/xml' },
          signal: AbortSignal.timeout(8000),
        });
        const raw_text = await res.text();
        const parsed_items = res.ok ? parse_xml_items(raw_text, now_time_str) : [];

        if (parsed_items.length > 0) {
          return NextResponse.json<RealtimeEmergencyResponse>({
            is_live_api: true,
            source: '국립중앙의료원(NMC) 중앙응급의료센터 실시간 OpenAPI (E-Gen Live)',
            sido,
            sigungu,
            last_updated: `${now_time_str} (실시간 동기화)`,
            api_status: '실시간 연동',
            local_hospital: parsed_items[0],
            regional_center: parsed_items.length > 1 ? parsed_items[1] : null,
            all_hospitals: parsed_items,
          });
        }
        api_status = 실패_사유(res.status, raw_text);
        if (/SERVICE_KEY|서비스키/.test(api_status)) {
          // 키 값은 내보내지 않고 길이·해시 앞 6자리만 붙여, 로컬 .env.local 키와 같은지 비교할 수 있게 한다
          api_status += ` (키 길이 ${service_key.length} · 지문 ${createHash('sha256').update(service_key).digest('hex').slice(0, 6)})`;
        }
      } catch (api_err) {
        api_status = api_err instanceof Error && api_err.name === 'TimeoutError' ? '응답 시간 초과(8초)' : '네트워크 오류';
      }
      console.warn(`[E-Gen 실시간] ${sido} ${sigungu} 조회 실패: ${api_status}`);
    }

    // 2. 서비스키 미입력 또는 API 실패 시: 플랫폼 내장 기준 데이터 반환
    //    (실제 병상 현황이 아니므로 임의 변동을 주지 않고, 실시간이 아님을 명시)
    const resource = 공공의료_자원_서비스.get_integrated_resources(sigungu, sido);
    const base_hospitals: 실시간_응급실_기관정보[] = (resource.응급의료기관_목록 || []).map((h) => ({
      ...h,
      최종_업데이트: '기준 데이터 (실시간 아님)',
    }));

    const local_h = base_hospitals[0] || null;
    const regional_h = base_hospitals.length > 1 ? base_hospitals[1] : null;

    return NextResponse.json<RealtimeEmergencyResponse>({
      is_live_api: false,
      source: service_key
        ? `플랫폼 내장 기준 데이터 (공공데이터포털 실시간 API 조회 실패: ${api_status} · 실제 병상 현황 아님)`
        : '플랫폼 내장 기준 데이터 (공공데이터 API 키 미등록 · 실제 병상 현황 아님)',
      sido,
      sigungu,
      last_updated: `기준 데이터 (조회 ${now_time_str})`,
      api_status,
      local_hospital: local_h,
      regional_center: regional_h,
      all_hospitals: base_hospitals,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: '응급의료 API 처리 중 오류 발생', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * E-Gen XML 응답 문자열 파싱 헬퍼
 */
function parse_xml_items(xml: string, time_str: string): 실시간_응급실_기관정보[] {
  const items: 실시간_응급실_기관정보[] = [];
  const item_regex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = item_regex.exec(xml)) !== null) {
    const item_xml = match[1];

    const get_val = (tag: string) => {
      const tag_m = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(item_xml);
      return tag_m ? tag_m[1].trim() : '';
    };

    const dutyName = get_val('dutyName');
    const hpid = get_val('hpid');
    const hvec = parseInt(get_val('hvec') || '0', 10); // 일반응급실 가용병상
    const hv2 = parseInt(get_val('hv2') || '0', 10);   // 내과중환자실
    const hvcc = parseInt(get_val('hvcc') || '0', 10); // 신경과중환자실
    const hvncc = parseInt(get_val('hvncc') || '0', 10); // 신생아중환자실
    const hv28 = parseInt(get_val('hv28') || '0', 10); // 응급실 소아 병상
    const hvidate = get_val('hvidate'); // 기관 입력일시 (YYYYMMDDHHMMSS)
    const dutyTel3 = get_val('dutyTel3') || '033-370-9114';

    const ct_yn = get_val('hvctayn') === 'Y';
    const mri_yn = get_val('hvmriayn') === 'Y';
    const venti_yn = get_val('hvventiayn') === 'Y';
    const inck_yn = get_val('hvinckayn') === 'Y';

    let saturation: 실시간_응급실_기관정보['포화도_상태'] = '보통';
    if (hvec >= 5) saturation = '여유';
    else if (hvec <= 1) saturation = '혼잡';
    else if (hvec < 0) saturation = '포화';

    if (dutyName) {
      items.push({
        기관명: dutyName,
        기관코드: hpid || `HP_${items.length + 1}`,
        응급실_구분: dutyName.includes('권역')
          ? '권역응급센터'
          : dutyName.includes('의료원')
          ? '지역응급기관'
          : '지역응급센터',
        주소: '소재지 관내',
        전화번호: dutyTel3,
        응급실_가용병상: Math.max(0, hvec),
        응급실_총병상: 20,
        소아_가용병상: Math.max(0, hv28), // E-Gen hv28 (응급실 소아). 이전에는 신생아중환자실(hvncc)을 잘못 넣고 있었음
        신생아중환자실_가용병상: Math.max(0, hvncc),
        최종_입력일시: hvidate || undefined,
        음압격리_가용병상: 1,
        중환자실_가용병상: Math.max(0, hv2 + hvcc),
        장비가동상태: {
          CT: ct_yn,
          MRI: mri_yn,
          인공호흡기: venti_yn,
          인큐베이터: inck_yn,
        },
        포화도_상태: saturation,
        최종_업데이트: `${time_str} (E-Gen Live)`,
      });
    }
  }

  return items;
}
