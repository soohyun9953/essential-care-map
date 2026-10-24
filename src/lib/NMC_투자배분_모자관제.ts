// ③ NMC › 3-3 기능보강 투자배분 & 중앙모자의료 관제·환류 (AP-04·06)
// - 투자 우선순위 시뮬레이터(AIS-04-03~04): 지역수요 × 활용률 × 유지비 부담을 공시기관 내 백분위로 바꿔 가중합 (플랫폼 규칙)
//   · 지역수요: 소재 시군구 종합 취약도 점수 (헬스맵 2024)
//   · 활용률(대리지표): 소재 시군구 입원 자체충족률 (2024 환자 유출입) — 기관별 시설·장비 가동률 자료가 없어 대신 사용
//   · 유지비 부담: 경상운영비 ÷ 의료수익 (알리미 수입·지출)
// - 미갱신 경보(AIS-06-05): E-Gen 실시간 입력일시(hvidate)가 기준 시간보다 오래된 기관

import { 알리미_기관_공시_목록, type 알리미_기관_공시 } from './알리미_경영공시_데이터셋';
import { 알리미_소재지, 최근_결산연도 } from './알리미_경영지표';
import { 전국_시군구_진단_데이터 } from './시군구_데이터셋';
import { 환자_유출입_2024_데이터 } from './환자_유출입_데이터셋';
import { 필수의료_진단_엔진 } from './필수의료_엔진';

export interface 투자_후보 {
  기관명: string;
  시군구: string;
  지역수요: number | null;
  활용률: number | null;
  유지비부담: number | null;
  정부지원_억: number | null;
  지자체지원_억: number | null;
  의사직: number | null;
  간호직: number | null;
}

const 억 = (v: number | null) => (v === null ? null : Math.round(v / 10000) / 10);

export function 투자_후보_목록(): 투자_후보[] {
  return 알리미_기관_공시_목록
    .filter((h) => h.유형 !== '적십자병원')
    .map((h: 알리미_기관_공시) => {
      const 지 = 알리미_소재지(h);
      const 원천 = 지 ? 전국_시군구_진단_데이터.find((r) => r.시도명 === 지.시도명 && r.시군구명 === 지.시군구명) : undefined;
      const 진단 = 원천 ? 필수의료_진단_엔진.diagnose_region(원천) : null;
      const 유출입 = 원천 ? Object.values(환자_유출입_2024_데이터).find((f) => String(f.code) === 원천.시군구코드) : undefined;
      const r = 최근_결산연도(h);
      return {
        기관명: h.기관명,
        시군구: 지 ? `${지.시도명} ${지.시군구명}` : '-',
        지역수요: 진단?.종합_취약도_점수 ?? null,
        활용률: 유출입 ? 유출입.ri : null,
        // 경상운영비 0원 공시는 미공시로 본다 (0이면 유지비 부담이 가장 낮은 것으로 잘못 계산됨)
        유지비부담: r && r.경상운영비 && r.의료수익 ? Math.round((r.경상운영비 / r.의료수익) * 1000) / 10 : null,
        정부지원_억: 억(r?.정부지원금 ?? null),
        지자체지원_억: 억(r?.지자체지원금 ?? null),
        의사직: r?.의사직_현원 ?? null,
        간호직: r?.간호직_현원 ?? null,
      };
    });
}

const 백분위 = (값: number | null, 전체: number[]) => {
  if (값 === null || 전체.length < 2) return null;
  return Math.round((전체.filter((v) => v < 값).length / (전체.length - 1)) * 100);
};

export interface 가중치 {
  수요: number;
  활용: number;
  유지비: number;
}

/** 우선순위 점수 = (수요 백분위×w수요 + 활용 백분위×w활용 + (100 − 유지비 백분위)×w유지비) ÷ 가중치 합 */
export function 투자_우선순위(후보: 투자_후보[], w: 가중치) {
  const 열 = (k: '지역수요' | '활용률' | '유지비부담') => 후보.map((x) => x[k]).filter((v): v is number => v !== null);
  const 수요s = 열('지역수요'), 활용s = 열('활용률'), 유지s = 열('유지비부담');
  const 합 = w.수요 + w.활용 + w.유지비 || 1;
  return 후보
    .map((x) => {
      const a = 백분위(x.지역수요, 수요s), b = 백분위(x.활용률, 활용s), c = 백분위(x.유지비부담, 유지s);
      const 점수 = a === null || b === null || c === null ? null : Math.round((a * w.수요 + b * w.활용 + (100 - c) * w.유지비) / 합);
      return { ...x, 수요_백분위: a, 활용_백분위: b, 유지비_백분위: c, 점수 };
    })
    .sort((p, q) => (q.점수 ?? -1) - (p.점수 ?? -1));
}

/** E-Gen hvidate(YYYYMMDDHHMMSS, 한국시간) → 경과 분 */
export function 입력_경과분(hvidate: string | undefined, 지금: Date = new Date()): number | null {
  if (!hvidate || !/^\d{14}$/.test(hvidate)) return null;
  const iso = `${hvidate.slice(0, 4)}-${hvidate.slice(4, 6)}-${hvidate.slice(6, 8)}T${hvidate.slice(8, 10)}:${hvidate.slice(10, 12)}:${hvidate.slice(12, 14)}+09:00`;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : Math.round((지금.getTime() - t) / 60000);
}
