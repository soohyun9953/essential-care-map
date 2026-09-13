// 국립중앙의료원 매뉴얼 기준 7대 진료역량 지표 및 사분면(Quadrant) 분석 엔진

import { 필수의료_진단_결과 } from './필수의료_타입';

export type 진료역량_지표_유형 =
  | 'DRG_개수'
  | '평균_재원일수'
  | '수술비중'
  | '중증도비중'
  | '최빈_MDC_비율'
  | '전문재활비율'
  | '전원입원_비율';

export interface 진료역량_메타정보 {
  키: 진료역량_지표_유형;
  이름: string;
  단위: string;
  설명: string;
  지향방향: '높을수록우수' | '낮을수록우수' | '중립';
  전국평균: number;
}

export const 진료역량_지표_목록: Record<진료역량_지표_유형, 진료역량_메타정보> = {
  DRG_개수: {
    키: 'DRG_개수',
    이름: 'DRG 질병군 종류 수',
    단위: '개',
    설명: '치료 질환군의 다양성 (많을수록 종합병원 성격의 포괄적 진료)',
    지향방향: '높을수록우수',
    전국평균: 486,
  },
  평균_재원일수: {
    키: '평균_재원일수',
    이름: '평균 재원일수',
    단위: '일',
    설명: '환자 1인당 평균 입원일수 (짧을수록 급성기 치료 집중도 우수)',
    지향방향: '낮을수록우수',
    전국평균: 10.7,
  },
  수술비중: {
    키: '수술비중',
    이름: '수술 환자 비중',
    단위: '%',
    설명: '전체 입원 환자 중 수술 환자 비율 (적극적 급성기 진료 역량)',
    지향방향: '높을수록우수',
    전국평균: 26.8,
  },
  중증도비중: {
    키: '중증도비중',
    이름: '중증도 비중 (전문진료질병군)',
    단위: '%',
    설명: '고난도 전문진료질병군(A군) 환자 비율',
    지향방향: '높을수록우수',
    전국평균: 20.3,
  },
  최빈_MDC_비율: {
    키: '최빈_MDC_비율',
    이름: '최빈 MDC 진료 비율',
    단위: '%',
    설명: '가장 많이 진료한 주진단범주 비중 (높을수록 특정 질환 전문화)',
    지향방향: '중립',
    전국평균: 23.0,
  },
  전문재활비율: {
    키: '전문재활비율',
    이름: '전문재활 진료 비율',
    단위: '%',
    설명: '전문재활 수가 청구 에피소드 비율 (아급성기 진료 특화도)',
    지향방향: '중립',
    전국평균: 1.4,
  },
  전원입원_비율: {
    키: '전원입원_비율',
    이름: '3일 이내 전원입원 비율',
    단위: '%',
    설명: '타 병원 급성기 치료 후 전원된 환자 비율 (회복기 진료 연계)',
    지향방향: '중립',
    전국평균: 2.1,
  },
};

export interface 병원_역량_데이터포인트 {
  기관명: string;
  종별: string;
  병상규모: string;
  선택기관_여부: boolean;
  DRG_개수: number;
  평균_재원일수: number;
  수술비중: number;
  중증도비중: number;
  최빈_MDC_비율: number;
  전문재활비율: number;
  전원입원_비율: number;
}

export interface 역량_3개년_추이 {
  연도: number; // 2022, 2023, 2024
  기관값: number;
  지역평균: number;
  전국평균: number;
}

/**
 * 7대 진료역량 평가 및 사분면 포지셔닝 분석 클래스
 */
export class 진료역량_엔진 {
  /**
   * 선택된 시군구/병원의 7대 진료역량 수치를 생성하는 함수
   */
  public static calculate_competency_profile(region: 필수의료_진단_결과): 병원_역량_데이터포인트 {
    const is_safe = region.종합_취약도_등급 === '정상';
    const is_critical = region.종합_취약도_등급 === '심각';

    // 취약도 및 인구 규모를 기반으로 현실적인 진료역량 지표 산출
    const drg_count = is_safe
      ? Math.round(520 + Math.random() * 80)
      : is_critical
      ? Math.round(310 + Math.random() * 70)
      : Math.round(410 + Math.random() * 80);

    const los = is_safe
      ? Math.round((8.8 + Math.random() * 2.2) * 10) / 10
      : is_critical
      ? Math.round((14.2 + Math.random() * 3.5) * 10) / 10
      : Math.round((11.5 + Math.random() * 2.5) * 10) / 10;

    const surgery_rate = is_safe
      ? Math.round((32.0 + Math.random() * 8.0) * 10) / 10
      : is_critical
      ? Math.round((12.5 + Math.random() * 6.5) * 10) / 10
      : Math.round((21.0 + Math.random() * 8.0) * 10) / 10;

    const severity_rate = is_safe
      ? Math.round((24.5 + Math.random() * 6.5) * 10) / 10
      : is_critical
      ? Math.round((8.5 + Math.random() * 5.0) * 10) / 10
      : Math.round((14.0 + Math.random() * 6.0) * 10) / 10;

    const top_mdc_rate = Math.round((14.0 + Math.random() * 12.0) * 10) / 10;
    const rehab_rate = Math.round((0.8 + Math.random() * 2.5) * 10) / 10;
    const transfer_rate = Math.round((1.2 + Math.random() * 2.8) * 10) / 10;

    return {
      기관명: `${region.시군구명} 대표거점병원`,
      종별: region.인구수 > 300000 ? '종합병원 (500병상 이상)' : '종합병원 (300-499병상)',
      병상규모: region.인구수 > 300000 ? '500병상 이상' : '300-499병상',
      선택기관_여부: true,
      DRG_개수: drg_count,
      평균_재원일수: los,
      수술비중: surgery_rate,
      중증도비중: severity_rate,
      최빈_MDC_비율: top_mdc_rate,
      전문재활비율: rehab_rate,
      전원입원_비율: transfer_rate,
    };
  }

  /**
   * 비교 분석을 위해 동일 진료권 및 유사 규모 가상 병원 군집(15개소)을 생성하는 함수
   */
  public static generate_peer_hospitals(target_hospital: 병원_역량_데이터포인트): 병원_역량_데이터포인트[] {
    const peers: 병원_역량_데이터포인트[] = [target_hospital];

    const names = [
      '권역 거점 종합병원 A',
      '지역 책임의료원 B',
      '지방 공공병원 C',
      '도립의료원 D',
      '적십자병원 E',
      '지역 종합병원 F',
      '전문진료센터 G',
      '공공보건병원 H',
      '권역외상센터 I',
      '시립의료원 J',
      '특화 종합병원 K',
      '중진료권 거점병원 L',
    ];

    names.forEach((name, idx) => {
      const variance = (idx % 2 === 0 ? 1 : -1) * (0.1 + (idx * 0.03));
      peers.push({
        기관명: name,
        종별: target_hospital.종별,
        병상규모: target_hospital.병상규모,
        선택기관_여부: false,
        DRG_개수: Math.round(486 * (1 + variance * 0.4)),
        평균_재원일수: Math.round(10.7 * (1 - variance * 0.3) * 10) / 10,
        수술비중: Math.round(26.8 * (1 + variance * 0.5) * 10) / 10,
        중증도비중: Math.round(20.3 * (1 + variance * 0.5) * 10) / 10,
        최빈_MDC_비율: Math.round(23.0 * (1 + variance * 0.3) * 10) / 10,
        전문재활비율: Math.round(1.4 * (1 + variance * 0.6) * 10) / 10,
        전원입원_비율: Math.round(2.1 * (1 + variance * 0.5) * 10) / 10,
      });
    });

    return peers;
  }

  /**
   * 특정 진료역량 지표의 최근 3개년(2022~2024년) 추이 생성
   */
  public static get_3year_trend(
    current_val: number,
    metric_key: 진료역량_지표_유형
  ): 역량_3개년_추이[] {
    const nat_avg = 진료역량_지표_목록[metric_key].전국평균;
    return [
      {
        연도: 2022,
        기관값: Math.round((current_val * 0.92) * 10) / 10,
        지역평균: Math.round((nat_avg * 0.95) * 10) / 10,
        전국평균: Math.round((nat_avg * 0.96) * 10) / 10,
      },
      {
        연도: 2023,
        기관값: Math.round((current_val * 0.96) * 10) / 10,
        지역평균: Math.round((nat_avg * 0.98) * 10) / 10,
        전국평균: Math.round((nat_avg * 0.98) * 10) / 10,
      },
      {
        연도: 2024,
        기관값: current_val,
        지역평균: nat_avg,
        전국평균: nat_avg,
      },
    ];
  }

  /**
   * 사분면 위치에 따른 전략적 시사점 문구 판정 함수
   */
  public static get_quadrant_insight(
    target: 병원_역량_데이터포인트,
    x_metric: 진료역량_지표_유형,
    y_metric: 진료역량_지표_유형
  ): { 사분면: string; 평가: string; 권고사항: string } {
    const x_meta = 진료역량_지표_목록[x_metric];
    const y_meta = 진료역량_지표_목록[y_metric];

    const x_val = target[x_metric];
    const y_val = target[y_metric];

    const is_x_high = x_val >= x_meta.전국평균;
    const is_y_high = y_val >= y_meta.전국평균;

    if (is_x_high && is_y_high) {
      return {
        사분면: '제1사분면 (선도·우수 영역)',
        평가: `${x_meta.이름} 및 ${y_meta.이름} 모두 전국 및 지역 평균을 상회하여 포괄적인 상급 진료 기능을 수행 중임.`,
        권고사항: '지역 대표 거점의료기관으로서의 위상을 강화하고, 중증·고난도 특화 진료 분야를 선제적으로 육성할 것.',
      };
    } else if (!is_x_high && is_y_high) {
      return {
        사분면: '제2사분면 (특화·집중 영역)',
        평가: `${y_meta.이름}은 높으나 ${x_meta.이름}은 다소 낮은 수준으로, 특정 영역 중심의 진료 패턴을 보임.`,
        권고사항: '특화 진료과목의 강점을 극대화하면서 부족한 진료 기능의 저해요인을 분석하여 연계 보완책을 마련할 것.',
      };
    } else if (!is_x_high && !is_y_high) {
      return {
        사분면: '제3사분면 (역량 보강 시급 영역)',
        평가: `선택된 두 지표 모두 기준치 대비 취약하여 급성기 진료 기능 위축 및 환자 유출 위험이 존재함.`,
        권고사항: '의료진 확보, 시설·장비 현대화 및 정부 필수공공의료 국비 지원 공모사업을 통한 집중 투자가 필요함.',
      };
    } else {
      return {
        사분면: '제4사분면 (효율성 중심 영역)',
        평가: `${x_meta.이름} 지표는 양호하나 ${y_meta.이름} 지표에서 상대적 정체가 관찰됨.`,
        권고사항: '진료 프로세스 개선 및 적정 재원일수 관리, 지역 책임의료기관 협진 체계 구축을 추진할 것.',
      };
    }
  }
}
