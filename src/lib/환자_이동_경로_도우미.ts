/**
 * 환자 의료이용 이동 경로(OD Flow) 및 2차 베지에 곡선(Quadratic Bezier Arc) 계산 도우미
 * 
 * - 전국 228개 시군구 대표 위경도 좌표 매핑
 * - 시작점 ➔ 제어점 ➔ 끝점 베지에 보간 곡선 Polyline 생성
 * - 재원일수 및 유출입 비중에 따른 선 두께, 색상, 애니메이션 속성 자동 산출
 */

import { 시군구_환자_유출입_데이터 } from './환자_유출입_데이터셋';
import {
  전국_시군구_위치_데이터,
  전국_시군구_대표_좌표,
  get_sgg_coordinates,
} from './시군구_경계_데이터';
import { 전국_70개_중진료권_데이터 } from './중진료권_데이터셋';

// 하위 호환성을 위해 전국_시군구_대표_좌표 및 get_sgg_coordinates 재익스포트
export { 전국_시군구_대표_좌표, get_sgg_coordinates };

/**
 * 2차 베지에 곡선(Quadratic Bezier Curve) 점열 생성 함수
 * 
 * @param start 시작점 [lat, lng]
 * @param end 끝점 [lat, lng]
 * @param curvature 곡률 (양수: 시계방향 만곡, 음수: 반시계방향 만곡)
 * @param steps 보간 스텝 수 (기본 28개)
 */
export function generate_bezier_arc(
  start: [number, number],
  end: [number, number],
  curvature: number = 0.22,
  steps: number = 28
): [number, number][] {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  // 두 점이 거의 같으면 시작점만 반환
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  if (distance < 0.0001) {
    return [start, end];
  }

  // 중간점 M
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  // 법선 벡터 (거리 대비 수직 방향 오프셋)
  // [dLat, dLng]의 수직 벡터 = [-dLng, dLat]
  const normalLat = -dLng / distance;
  const normalLng = dLat / distance;

  // 제어점 C (거리에 비례한 휠림 높이 설정)
  const offsetDistance = Math.max(distance * curvature, 0.05);
  const ctrlLat = midLat + normalLat * offsetDistance;
  const ctrlLng = midLng + normalLng * offsetDistance;

  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const invT = 1 - t;

    // B(t) = (1-t)^2 * P0 + 2(1-t)t * P_ctrl + t^2 * P1
    const lat = invT * invT * lat1 + 2 * invT * t * ctrlLat + t * t * lat2;
    const lng = invT * invT * lng1 + 2 * invT * t * ctrlLng + t * t * lng2;

    points.push([lat, lng]);
  }

  return points;
}

/**
 * 플로우맵에 렌더링될 개별 호(Arc) 인터페이스
 */
export interface 환자_이동_아크 {
  id: string;
  type: 'outflow' | 'inflow';
  origin_name: string;
  origin_sido: string;
  dest_name: string;
  dest_sido: string;
  start_coords: [number, number];
  end_coords: [number, number];
  arc_path: [number, number][];
  days: number;
  pct: number;
  weight: number;      // 픽셀 선 두께 (2 ~ 8)
  color: string;       // HEX 색상코드
  is_primary: boolean; // 상위 1, 2위 여부
  detail_info: {
    tertiary_days?: number;
    general_days?: number;
    dialysis_days?: number;
    er_days?: number;
  };
}

/**
 * 시군구 환자 유출입 데이터를 입력받아 지도용 아크 리스트 생성
 */
export function build_patient_flow_arcs(
  flow_data: 시군구_환자_유출입_데이터,
  mode: 'all' | 'outflow' | 'inflow' = 'all'
): 환자_이동_아크[] {
  const arcs: 환자_이동_아크[] = [];
  const origin_coords = get_sgg_coordinates(flow_data.sgg, flow_data.sido);

  // 1. 관외 유출(Outflow) 경로 생성
  if (mode === 'all' || mode === 'outflow') {
    const non_self_outflows = flow_data.outflow_top
      .filter((dest) => !dest.is_self && dest.days > 0)
      .slice(0, 6); // 상위 6개지

    non_self_outflows.forEach((dest, idx) => {
      const dest_coords = get_sgg_coordinates(dest.dest_sgg, dest.dest_sido);
      
      // 유출 곡선은 살짝 우측(시계방향)으로 휨
      // 순위별로 겹치지 않게 곡률을 미세 조절
      const curvature = 0.18 + (idx % 2 === 0 ? 0.05 : -0.04);
      const arc_path = generate_bezier_arc(origin_coords, dest_coords, curvature);

      // 선 두께는 점유율 또는 재원일수에 비례 (3px ~ 7.5px)
      const weight = Math.min(Math.max(dest.pct / 4, 2.5), 7.5);

      arcs.push({
        id: `outflow-${flow_data.sgg}-${dest.dest_sgg}-${idx}`,
        type: 'outflow',
        origin_name: flow_data.sgg,
        origin_sido: flow_data.sido,
        dest_name: dest.dest_sgg,
        dest_sido: dest.dest_sido,
        start_coords: origin_coords,
        end_coords: dest_coords,
        arc_path: arc_path,
        days: dest.days,
        pct: dest.pct,
        weight: weight,
        color: idx === 0 ? '#f43f5e' : '#fb7185', // 1위는 진한 로즈 레드, 나머지는 부드러운 로즈
        is_primary: idx < 2,
        detail_info: {
          tertiary_days: dest.tertiary_days,
          general_days: dest.general_days,
          dialysis_days: dest.dialysis_days,
          er_days: dest.er_days,
        },
      });
    });
  }

  // 2. 타지역 유입(Inflow) 경로 생성
  if (mode === 'all' || mode === 'inflow') {
    const non_self_inflows = flow_data.inflow_top
      .filter((orig) => !orig.is_self && orig.days > 0)
      .slice(0, 5); // 상위 5개지

    non_self_inflows.forEach((orig, idx) => {
      const orig_coords = get_sgg_coordinates(orig.orig_sgg, orig.orig_sido);

      // 유입 곡선은 반대 방향(반시계방향)으로 휨
      const curvature = -(0.18 + (idx % 2 === 0 ? 0.05 : -0.04));
      const arc_path = generate_bezier_arc(orig_coords, origin_coords, curvature);

      const weight = Math.min(Math.max(orig.pct / 3, 2.5), 6.5);

      arcs.push({
        id: `inflow-${orig.orig_sgg}-${flow_data.sgg}-${idx}`,
        type: 'inflow',
        origin_name: orig.orig_sgg,
        origin_sido: orig.orig_sido,
        dest_name: flow_data.sgg,
        dest_sido: flow_data.sido,
        start_coords: orig_coords,
        end_coords: origin_coords,
        arc_path: arc_path,
        days: orig.days,
        pct: orig.pct,
        weight: weight,
        color: idx === 0 ? '#10b981' : '#34d399', // 1위는 선명한 에메랄드, 나머지는 민트
        is_primary: idx < 2,
        detail_info: {},
      });
    });
  }

  return arcs;
}
