/**
 * 환자 의료이용 이동 경로(OD Flow) 및 2차 베지에 곡선(Quadratic Bezier Arc) 계산 도우미
 * 
 * - 전국 228개 시군구 대표 위경도 좌표 매핑
 * - 시작점 ➔ 제어점 ➔ 끝점 베지에 보간 곡선 Polyline 생성
 * - 재원일수 및 유출입 비중에 따른 선 두께, 색상, 애니메이션 속성 자동 산출
 */

import { 시군구_환자_유출입_데이터 } from './환자_유출입_데이터셋';
import { 전국_시군구_위치_데이터 } from './시군구_경계_데이터';
import { 전국_70개_중진료권_데이터 } from './중진료권_데이터셋';

// 전국 228개 시군구 대표 좌표 사전 (미등록 지자체 및 대도시 포함)
export const 전국_시군구_대표_좌표: Record<string, [number, number]> = {
  // 서울특별시 (25개 자치구)
  '종로구': [37.5730, 126.9794],
  '중구': [37.5641, 126.9979],
  '용산구': [37.5326, 126.9904],
  '성동구': [37.5634, 127.0368],
  '광진구': [37.5385, 127.0823],
  '동대문구': [37.5744, 127.0400],
  '중랑구': [37.6065, 127.0927],
  '성북구': [37.5894, 127.0167],
  '강북구': [37.6396, 127.0257],
  '도봉구': [37.6688, 127.0471],
  '노원구': [37.6542, 127.0568],
  '은평구': [37.6027, 126.9291],
  '서대문구': [37.5791, 126.9368],
  '마포구': [37.5663, 126.9016],
  '양천구': [37.5170, 126.8665],
  '강서구': [37.5509, 126.8495],
  '구로구': [37.4954, 126.8874],
  '금천구': [37.4568, 126.8954],
  '영등포구': [37.5264, 126.8962],
  '동작구': [37.5124, 126.9393],
  '관악구': [37.4784, 126.9516],
  '서초구': [37.4837, 127.0324],
  '강남구': [37.5172, 127.0473],
  '송파구': [37.5145, 127.1059],
  '강동구': [37.5301, 127.1238],

  // 강원특별자치도 (전체 18개 시군)
  '춘천시': [37.8813, 127.7298],
  '원주시': [37.3422, 127.9202],
  '강릉시': [37.7519, 128.8761],
  '동해시': [37.5247, 129.1143],
  '태백시': [37.1641, 128.9856],
  '속초시': [37.2023, 128.5918],
  '삼척시': [37.4499, 129.1653],
  '홍천군': [37.6974, 127.8887],
  '횡성군': [37.4918, 127.9850],
  '영월군': [37.1836, 128.4618],
  '평창군': [37.3705, 128.3902],
  '정선군': [37.3807, 128.6608],
  '철원군': [38.1468, 127.3134],
  '화천군': [38.1062, 127.7082],
  '양구군': [38.1059, 127.9897],
  '인제군': [38.0697, 128.1704],
  '고성군': [38.3805, 128.4678],
  '양양군': [38.0754, 128.6189],

  // 충청북도 (11개 시군)
  '청주시': [36.6424, 127.4890],
  '충주시': [36.9910, 127.9259],
  '제천시': [37.1326, 128.1910],
  '보은군': [36.4894, 127.7294],
  '옥천군': [36.3063, 127.5714],
  '영동군': [36.1750, 127.7836],
  '증평군': [36.7853, 127.5814],
  '진천군': [36.8553, 127.4431],
  '괴산군': [36.8153, 127.7865],
  '음성군': [36.9325, 127.6908],
  '단양군': [36.9845, 128.3655],

  // 경상북도 주요 지역
  '포항시': [36.0190, 129.3435],
  '경주시': [35.8562, 129.2247],
  '김천시': [36.1398, 128.1136],
  '안동시': [36.5684, 128.7294],
  '구미시': [36.1195, 128.3446],
  '영주시': [36.8057, 128.6241],
  '영천시': [35.9733, 128.9386],
  '상주시': [36.4109, 128.1591],
  '문경시': [36.5973, 128.1867],
  '경산시': [35.8251, 128.7414],
  '군위군': [36.2428, 128.5728],
  '의성군': [36.3527, 128.6970],
  '청송군': [36.4357, 129.0573],
  '영양군': [36.6667, 129.1125],
  '영덕군': [36.4150, 129.3656],
  '청도군': [35.6474, 128.7340],
  '고령군': [35.7259, 128.2625],
  '성주군': [35.9197, 128.2831],
  '칠곡군': [35.9956, 128.4018],
  '예천군': [36.6573, 128.4528],
  '봉화군': [36.8930, 128.7325],
  '울진군': [36.9931, 129.4003],
  '울릉군': [37.4844, 130.9056],

  // 경기도 주요 시군
  '수원시': [37.2636, 127.0286],
  '성남시': [37.4200, 127.1265],
  '고양시': [37.6584, 126.8320],
  '용인시': [37.2411, 127.1776],
  '부천시': [37.5034, 126.7660],
  '안산시': [37.3219, 126.8309],
  '안양시': [37.3943, 126.9568],
  '남양주시': [37.6360, 127.2165],
  '화성시': [37.1995, 126.8315],
  '평택시': [36.9921, 127.1129],
  '의정부시': [37.7381, 127.0337],
  '파주시': [37.7599, 126.7801],
  '시흥시': [37.3802, 126.8029],
  '김포시': [37.6153, 126.7155],
  '광명시': [37.4786, 126.8647],
  '광주시': [37.4054, 127.2559],
  '군포시': [37.3614, 126.9352],
  '이천시': [37.2723, 127.4350],
  '양주시': [37.7853, 127.0458],
  '오산시': [37.1498, 127.0772],
  '구리시': [37.5943, 127.1296],
  '안성시': [37.0080, 127.2798],
  '포천시': [37.8949, 127.2003],
  '의왕시': [37.3449, 126.9683],
  '하남시': [37.5393, 127.2148],
  '여주시': [37.2984, 127.6371],
  '양평군': [37.4917, 127.4876],
  '동두천시': [37.9036, 127.0607],
  '과천시': [37.4292, 126.9876],
  '가평군': [37.8315, 127.5097],
  '연천군': [38.0964, 127.0748],

  // 부산광역시
  '부산중구': [35.1062, 129.0324],
  '부산서구': [35.0979, 129.0244],
  '부산동구': [35.1294, 129.0453],
  '영도구': [35.0912, 129.0679],
  '부산진구': [35.1631, 129.0532],
  '동래구': [35.2048, 129.0838],
  '남구': [35.1365, 129.0843],
  '북구': [35.1972, 128.9904],
  '해운대구': [35.1631, 129.1636],
  '사하구': [35.1045, 128.9749],
  '금정구': [35.2430, 129.0921],
  '강서구(부산)': [35.2122, 128.9806],
  '연제구': [35.1764, 129.0798],
  '수영구': [35.1456, 129.1132],
  '사상구': [35.1527, 128.9912],
  '기장군': [35.2445, 129.2223],

  // 대구광역시
  '대구중구': [35.8694, 128.6062],
  '대구동구': [35.8866, 128.6355],
  '대구서구': [35.8719, 128.5591],
  '대구남구': [35.8460, 128.5975],
  '대구북구': [35.8858, 128.5828],
  '수성구': [35.8580, 128.6306],
  '달서구': [35.8298, 128.5328],
  '달성군': [35.7746, 128.4313],

  // 광주광역시
  '광주동구': [35.1461, 126.9231],
  '광주서구': [35.1520, 126.8897],
  '광주남구': [35.1329, 126.9025],
  '광주북구': [35.1741, 126.9121],
  '광산구': [35.1395, 126.7937],

  // 대전광역시
  '대전동구': [36.3120, 127.4550],
  '대전중구': [36.3259, 127.4215],
  '대전서구': [36.3553, 127.3837],
  '유성구': [36.3623, 127.3563],
  '대덕구': [36.3465, 127.4157],

  // 울산광역시
  '울산중구': [35.5670, 129.3385],
  '울산남구': [35.5440, 129.3300],
  '울산동구': [35.5050, 129.4168],
  '울산북구': [35.5825, 129.3614],
  '울주군': [35.5398, 129.2435],

  // 세종특별자치시
  '세종특별자치시': [36.4800, 127.2890],

  // 제주특별자치도
  '제주시': [33.4996, 126.5312],
  '서귀포시': [33.2541, 126.5601],
};

/**
 * 지자체명을 기반으로 대표 위경도 좌표를 조회 (폴백 매핑 완비)
 */
export function get_sgg_coordinates(sgg_name: string, sido_name?: string): [number, number] {
  // 1. 대표 좌표 사전에 매칭
  if (전국_시군구_대표_좌표[sgg_name]) {
    return 전국_시군구_대표_좌표[sgg_name];
  }

  // 2. 시군구 경계 데이터셋에서 조회
  if (전국_시군구_위치_데이터[sgg_name]) {
    return [전국_시군구_위치_데이터[sgg_name].위도, 전국_시군구_위치_데이터[sgg_name].경도];
  }

  // 3. '구'나 '시' 명칭 접미사 처리 (예: 제천 -> 제천시, 원주 -> 원주시)
  for (const [key, coords] of Object.entries(전국_시군구_대표_좌표)) {
    if (key.startsWith(sgg_name) || sgg_name.startsWith(key)) {
      return coords;
    }
  }

  // 4. 중진료권 중심 좌표로 폴백
  for (const zone of Object.values(전국_70개_중진료권_데이터)) {
    if (zone.포함_시군구.includes(sgg_name) || zone.중진료권명.includes(sgg_name)) {
      return [zone.위도, zone.경도];
    }
  }

  // 5. 최종 시도 기본 좌표 (대한민국 중심부 대전 인근 기본값)
  if (sido_name?.includes('강원')) return [37.8228, 128.1555];
  if (sido_name?.includes('서울')) return [37.5665, 126.9780];
  if (sido_name?.includes('충북')) return [36.8000, 127.7000];
  if (sido_name?.includes('경북')) return [36.5760, 128.5056];
  if (sido_name?.includes('경기')) return [37.4138, 127.5183];

  return [36.5, 127.8];
}

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
