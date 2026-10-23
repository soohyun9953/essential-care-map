// ② 의료기관 담당자 › 2-4 고위험 산모·신생아 전원의뢰·수용 매칭 (AP-06 병원용)
// - 중증도(AIS-06-01), 이송시간(AIS-06-04), 수용확률(AIS-06-03)을 곱해 수용기관 순위를 정하는 플랫폼 규칙 (임상 지침 아님)
// - 수용기관 좌표: E-Gen 응급의료기관 목록 / 신생아중환자실(NICU) 가용: E-Gen 실시간(hvncc, API 연동 시)
// - 산모·태아 집중치료실(MFICU) 가용은 E-Gen 실시간 항목이 없어 '자료 없음'
// - 이송시간은 직선거리 기반 추정 (도로 경로 아님)

import { 응급의료기관_목록 } from './응급의료기관_데이터셋';

export const 수용기관_후보 = [
  { 기관명: '강릉아산병원', 표시명: '강릉아산병원', 시군구: '강릉시' },
  { 기관명: '연세대학교원주세브란스기독병원', 표시명: '원주세브란스기독병원', 시군구: '원주시' },
  { 기관명: '강원대학교병원', 표시명: '강원대학교병원', 시군구: '춘천시' },
] as const;

export function 기관_좌표(기관명: string): { 위도: number; 경도: number } | null {
  const h = 응급의료기관_목록.find((x) => x.기관명 === 기관명);
  return h && h.위도 !== null && h.경도 !== null ? { 위도: h.위도, 경도: h.경도 } : null;
}

export function 직선거리_km(a: { 위도: number; 경도: number }, b: { 위도: number; 경도: number }): number {
  const R = 6371;
  const dLat = ((b.위도 - a.위도) * Math.PI) / 180;
  const dLon = ((b.경도 - a.경도) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.위도 * Math.PI) / 180) * Math.cos((b.위도 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** 이송시간 추정(분) = 직선거리 × 1.4(도로 우회계수) ÷ 70km/h — 구급차 실제 경로·기상 미반영 */
export const 이송시간_추정_분 = (km: number) => Math.round(((km * 1.4) / 70) * 60);

export interface 산모_정보 {
  재태주수: number;
  조기진통: boolean;
  조기양막파수: boolean;
  전자간증: boolean;
  다태아: boolean;
}

/** 중증도(AIS-06-01, 플랫폼 규칙 0~100): 재태주수 기본점수 + 위험요인 각 10점 */
export function 중증도_점수(p: 산모_정보): number {
  const w = p.재태주수;
  const 기본 = w < 28 ? 90 : w < 32 ? 75 : w < 34 ? 55 : w < 37 ? 35 : 15;
  const 가산 = [p.조기진통, p.조기양막파수, p.전자간증, p.다태아].filter(Boolean).length * 10;
  return Math.min(100, 기본 + 가산);
}

/** 수용확률(AIS-06-03, 플랫폼 규칙): 실시간 NICU 가용 병상 수 기준. 실시간 미연동이면 0.5(확인 필요) */
export function 수용확률(nicu_가용: number | null): { 값: number; 설명: string } {
  if (nicu_가용 === null) return { 값: 0.5, 설명: '실시간 미연동 — 전화 확인 필요' };
  if (nicu_가용 >= 2) return { 값: 0.9, 설명: `NICU 가용 ${nicu_가용}` };
  if (nicu_가용 === 1) return { 값: 0.6, 설명: 'NICU 가용 1' };
  return { 값: 0.15, 설명: 'NICU 가용 0' };
}

export interface 매칭_결과 {
  기관명: string;
  표시명: string;
  거리_km: number;
  이송_분: number;
  허용_분: number;
  이송점수: number;
  수용확률: number;
  수용_설명: string;
  적합도: number; // 0~100
}

/**
 * 적합도 = 수용확률 × 이송점수 × 100
 * 이송점수 = max(0.05, 1 − 이송분 ÷ 허용분), 허용분 = 240 − 1.5 × 중증도 (중증일수록 이송을 짧게 허용)
 */
export function 수용기관_매칭(
  출발: { 위도: number; 경도: number },
  중증도: number,
  nicu_가용: Record<string, number | null>
): 매칭_결과[] {
  const 허용_분 = Math.round(240 - 1.5 * 중증도);
  return 수용기관_후보
    .map((c) => {
      const 좌표 = 기관_좌표(c.기관명);
      const 거리 = 좌표 ? 직선거리_km(출발, 좌표) : NaN;
      const 이송 = 좌표 ? 이송시간_추정_분(거리) : NaN;
      const 이송점수 = Number.isFinite(이송) ? Math.max(0.05, 1 - 이송 / 허용_분) : 0;
      const 수용 = 수용확률(nicu_가용[c.기관명] ?? null);
      return {
        기관명: c.기관명,
        표시명: c.표시명,
        거리_km: Math.round(거리 * 10) / 10,
        이송_분: 이송,
        허용_분,
        이송점수: Math.round(이송점수 * 100) / 100,
        수용확률: 수용.값,
        수용_설명: 수용.설명,
        적합도: Math.round(수용.값 * 이송점수 * 100),
      };
    })
    .sort((a, b) => b.적합도 - a.적합도);
}
