import {
  환자_유출입_2024_데이터,
  시군구_환자_유출입_데이터,
  유출_목적지,
  유입_출처지,
} from './환자_유출입_데이터셋';
import { 전국_70개_중진료권_데이터, 중진료권_정보 } from './중진료권_데이터셋';
import { 전국_시군구_진단_데이터 } from './시군구_데이터셋';
import { format_number_comma } from './유틸리티';

export type 유출입_구분 = '유출' | '유입';
export type 분석_단위 = '시군구' | '중진료권' | '시도';

export interface 유출입_순위_항목 {
  rank: number;
  name: string;
  sido?: string;
  days: number;
  pct: number;
  is_self: boolean;
  tertiary_days?: number;
  general_days?: number;
  dialysis_days?: number;
  er_days?: number;
}

export interface 중진료권_유출입_통계 {
  rank: number;
  중진료권명: string;
  시도명: string;
  포함_시군구: string[];
  인구수: number;
  총_재원일수: number;
  자체_재원일수: number;
  유출_재원일수: number;
  유출률: number;
  유출_추정인구수: number;
  총_유입_재원일수: number;
  관외_유입_재원일수: number;
  관외_유입률: number;
  주요_유출_목적지: string[];
  주요_유입_출처지: string[];
}

export interface 시도_유출입_통계 {
  rank: number;
  시도명: string;
  인구수: number;
  총_재원일수: number;
  자체_재원일수: number;
  유출_재원일수: number;
  유출률: number;
  유출_추정인구수: number;
  총_유입_재원일수: number;
  관외_유입_재원일수: number;
}

export interface 시군구_유출입_순위_통계 {
  rank: number;
  시군구명: string;
  시도명: string;
  중진료권명: string;
  인구수: number;
  총_재원일수: number;
  유출_재원일수: number;
  유출률: number;
  유출_추정인구수: number;
  총_유입_재원일수: number;
  관외_유입_재원일수: number;
  관외_유입률: number;
}

export interface 질의_응답_결과 {
  query: string;
  category: '중진료권_유출' | '중진료권_유입' | '시도_유출입' | '시군구_유출입' | '특정지역_상세' | '일반_분석';
  title: string;
  summary: string;
  insights: string[];
  data_type: '중진료권' | '시도' | '시군구' | '지역상세';
  table_columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
  table_rows: Record<string, any>[];
  chart_data?: { name: string; value1: number; value2?: number; label1: string; label2?: string }[];
}

// ----------------------------------------------------------------------
// 1. 시군구 인구수 매핑 캐시
// ----------------------------------------------------------------------
const SGG_POP_MAP: Record<string, number> = {};
전국_시군구_진단_데이터.forEach((d) => {
  SGG_POP_MAP[d.시군구명] = d.인구수;
});

// ----------------------------------------------------------------------
// 2. 단일 시군구 기준 유출/유입 단위별 Top N 집계
// ----------------------------------------------------------------------
export function get_sgg_flow_rankings(
  sgg_name: string,
  direction: 유출입_구분 = '유출',
  unit: 분석_단위 = '시군구',
  top_n: number = 5
): 유출입_순위_항목[] {
  const data = 환자_유출입_2024_데이터[sgg_name];
  if (!data) return [];

  if (direction === '유출') {
    const raw_list = data.outflow_top || [];

    if (unit === '시군구') {
      return raw_list
        .filter((d) => !d.is_self && d.days > 0)
        .slice(0, top_n)
        .map((d, idx) => ({
          rank: idx + 1,
          name: d.dest_sgg,
          sido: d.dest_sido,
          days: d.days,
          pct: d.pct,
          is_self: d.is_self,
          tertiary_days: d.tertiary_days,
          general_days: d.general_days,
          dialysis_days: d.dialysis_days,
          er_days: d.er_days,
        }));
    }

    if (unit === '중진료권') {
      const mid_map: Record<string, { days: number; sido: string }> = {};
      const current_mid = data.mid;

      raw_list.forEach((d) => {
        if (!d.dest_mid || d.dest_mid === current_mid) return;
        if (!mid_map[d.dest_mid]) {
          mid_map[d.dest_mid] = { days: 0, sido: d.dest_sido };
        }
        mid_map[d.dest_mid].days += d.days;
      });

      const total_days = data.total_days || 1;
      return Object.entries(mid_map)
        .sort((a, b) => b[1].days - a[1].days)
        .slice(0, top_n)
        .map(([name, item], idx) => ({
          rank: idx + 1,
          name: name,
          sido: item.sido,
          days: item.days,
          pct: parseFloat(((item.days / total_days) * 100).toFixed(1)),
          is_self: false,
        }));
    }

    if (unit === '시도') {
      const sido_map: Record<string, number> = {};
      const current_sido = data.sido;

      raw_list.forEach((d) => {
        if (!d.dest_sido || d.dest_sido === current_sido) return;
        sido_map[d.dest_sido] = (sido_map[d.dest_sido] || 0) + d.days;
      });

      const total_days = data.total_days || 1;
      return Object.entries(sido_map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top_n)
        .map(([name, days], idx) => ({
          rank: idx + 1,
          name: name,
          days: days,
          pct: parseFloat(((days / total_days) * 100).toFixed(1)),
          is_self: false,
        }));
    }
  } else {
    // 유입 (Inflow)
    const raw_list = data.inflow_top || [];
    const total_inflow = data.total_inflow_days || 1;

    if (unit === '시군구') {
      return raw_list
        .filter((d) => !d.is_self && d.days > 0)
        .slice(0, top_n)
        .map((d, idx) => ({
          rank: idx + 1,
          name: d.orig_sgg,
          sido: d.orig_sido,
          days: d.days,
          pct: d.pct,
          is_self: d.is_self,
        }));
    }

    if (unit === '중진료권') {
      const mid_map: Record<string, { days: number; sido: string }> = {};
      const current_mid = data.mid;

      raw_list.forEach((d) => {
        if (!d.orig_mid || d.orig_mid === current_mid) return;
        if (!mid_map[d.orig_mid]) {
          mid_map[d.orig_mid] = { days: 0, sido: d.orig_sido };
        }
        mid_map[d.orig_mid].days += d.days;
      });

      return Object.entries(mid_map)
        .sort((a, b) => b[1].days - a[1].days)
        .slice(0, top_n)
        .map(([name, item], idx) => ({
          rank: idx + 1,
          name: name,
          sido: item.sido,
          days: item.days,
          pct: parseFloat(((item.days / total_inflow) * 100).toFixed(1)),
          is_self: false,
        }));
    }

    if (unit === '시도') {
      const sido_map: Record<string, number> = {};
      const current_sido = data.sido;

      raw_list.forEach((d) => {
        if (!d.orig_sido || d.orig_sido === current_sido) return;
        sido_map[d.orig_sido] = (sido_map[d.orig_sido] || 0) + d.days;
      });

      return Object.entries(sido_map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top_n)
        .map(([name, days], idx) => ({
          rank: idx + 1,
          name: name,
          days: days,
          pct: parseFloat(((days / total_inflow) * 100).toFixed(1)),
          is_self: false,
        }));
    }
  }

  return [];
}

// ----------------------------------------------------------------------
// 3. 전국 70개 중진료권 전수 유출입 통계 집계
// ----------------------------------------------------------------------
let cached_mid_flow_stats: 중진료권_유출입_통계[] | null = null;

export function get_all_mid_zones_flow_stats(): 중진료권_유출입_통계[] {
  if (cached_mid_flow_stats) return cached_mid_flow_stats;

  const result: 중진료권_유출입_통계[] = [];

  Object.entries(전국_70개_중진료권_데이터).forEach(([mid_name, mid_info]) => {
    let mid_pop = 0;
    let mid_total_days = 0;
    let mid_self_days = 0;
    let mid_total_inflow = 0;
    let mid_outsider_inflow = 0;

    const outflow_dest_map: Record<string, number> = {};
    const inflow_orig_map: Record<string, number> = {};

    mid_info.포함_시군구.forEach((sgg_name) => {
      // 1. 인구수
      const pop = SGG_POP_MAP[sgg_name] || 0;
      mid_pop += pop;

      // 2. 환자 유출입
      const flow = 환자_유출입_2024_데이터[sgg_name];
      if (flow) {
        mid_total_days += flow.total_days;
        mid_self_days += flow.self_days;
        mid_total_inflow += flow.total_inflow_days;
        mid_outsider_inflow += flow.outsider_inflow_days;

        // 권역 밖 유출 대상지 집계
        (flow.outflow_top || []).forEach((d) => {
          if (d.dest_mid !== mid_name && d.days > 0) {
            const label = `${d.dest_sido} ${d.dest_sgg}`;
            outflow_dest_map[label] = (outflow_dest_map[label] || 0) + d.days;
          }
        });

        // 권역 밖 유입 출처지 집계
        (flow.inflow_top || []).forEach((d) => {
          if (d.orig_mid !== mid_name && d.days > 0) {
            const label = `${d.orig_sido} ${d.orig_sgg}`;
            inflow_orig_map[label] = (inflow_orig_map[label] || 0) + d.days;
          }
        });
      }
    });

    const outflow_days = Math.max(0, mid_total_days - mid_self_days);
    const outflow_rate = mid_total_days > 0 ? (outflow_days / mid_total_days) * 100 : 0;
    // 유출 추정 인구수 = 중진료권 인구수 × 유출률
    const outflow_pop = Math.round((mid_pop * outflow_rate) / 100);
    const outsider_inflow_rate =
      mid_total_inflow > 0 ? (mid_outsider_inflow / mid_total_inflow) * 100 : 0;

    const top_outflows = Object.entries(outflow_dest_map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);

    const top_inflows = Object.entries(inflow_orig_map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);

    result.push({
      rank: 0,
      중진료권명: mid_name,
      시도명: mid_info.시도명,
      포함_시군구: mid_info.포함_시군구,
      인구수: mid_pop,
      총_재원일수: mid_total_days,
      자체_재원일수: mid_self_days,
      유출_재원일수: outflow_days,
      유출률: parseFloat(outflow_rate.toFixed(1)),
      유출_추정인구수: outflow_pop,
      총_유입_재원일수: mid_total_inflow,
      관외_유입_재원일수: mid_outsider_inflow,
      관외_유입률: parseFloat(outsider_inflow_rate.toFixed(1)),
      주요_유출_목적지: top_outflows,
      주요_유입_출처지: top_inflows,
    });
  });

  cached_mid_flow_stats = result;
  return result;
}

// ----------------------------------------------------------------------
// 4. 전국 17개 시도 유출입 통계 집계
// ----------------------------------------------------------------------
export function get_all_sido_flow_stats(): 시도_유출입_통계[] {
  const sido_map: Record<
    string,
    {
      인구수: number;
      총_재원일수: number;
      자체_재원일수: number;
      총_유입_재원일수: number;
      관외_유입_재원일수: number;
    }
  > = {};

  Object.values(환자_유출입_2024_데이터).forEach((flow) => {
    const sido = flow.sido;
    if (!sido_map[sido]) {
      sido_map[sido] = {
        인구수: 0,
        총_재원일수: 0,
        자체_재원일수: 0,
        총_유입_재원일수: 0,
        관외_유입_재원일수: 0,
      };
    }
    sido_map[sido].인구수 += SGG_POP_MAP[flow.sgg] || 0;
    sido_map[sido].총_재원일수 += flow.total_days;
    sido_map[sido].자체_재원일수 += flow.self_days;
    sido_map[sido].총_유입_재원일수 += flow.total_inflow_days;
    sido_map[sido].관외_유입_재원일수 += flow.outsider_inflow_days;
  });

  return Object.entries(sido_map).map(([sido, item]) => {
    const outflow_days = Math.max(0, item.총_재원일수 - item.자체_재원일수);
    const outflow_rate = item.총_재원일수 > 0 ? (outflow_days / item.총_재원일수) * 100 : 0;
    const outflow_pop = Math.round((item.인구수 * outflow_rate) / 100);

    return {
      rank: 0,
      시도명: sido,
      인구수: item.인구수,
      총_재원일수: item.총_재원일수,
      자체_재원일수: item.자체_재원일수,
      유출_재원일수: outflow_days,
      유출률: parseFloat(outflow_rate.toFixed(1)),
      유출_추정인구수: outflow_pop,
      총_유입_재원일수: item.총_유입_재원일수,
      관외_유입_재원일수: item.관외_유입_재원일수,
    };
  });
}

// ----------------------------------------------------------------------
// 5. 전국 228개 시군구 유출입 통계
// ----------------------------------------------------------------------
export function get_all_sgg_flow_stats(): 시군구_유출입_순위_통계[] {
  return Object.values(환자_유출입_2024_데이터).map((flow) => {
    const pop = SGG_POP_MAP[flow.sgg] || 0;
    const outflow_days = Math.max(0, flow.total_days - flow.self_days);
    const outflow_pop = Math.round((pop * flow.outflow_rate) / 100);

    return {
      rank: 0,
      시군구명: flow.sgg,
      시도명: flow.sido,
      중진료권명: flow.mid,
      인구수: pop,
      총_재원일수: flow.total_days,
      유출_재원일수: outflow_days,
      유출률: flow.outflow_rate,
      유출_추정인구수: outflow_pop,
      총_유입_재원일수: flow.total_inflow_days,
      관외_유입_재원일수: flow.outsider_inflow_days,
      관외_유입률: flow.outsider_inflow_rate,
    };
  });
}

// ----------------------------------------------------------------------
// 6. 자연어 질의 분석 & 응답 엔진 (Q&A Generator)
// ----------------------------------------------------------------------
function parse_query_limit(query: string, default_val: number = 10, max_val: number = 70): number {
  const match = query.match(/(?:top|상위|하위)\s*(\d+)/i) || 
                query.match(/(\d+)\s*(?:개|곳|개소|지역|권역|위)/i);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) {
      return Math.min(val, max_val);
    }
  }
  return default_val;
}

// 서울·경기가 전국 관외 유입 재원일수에서 차지하는 비중 (%)
function 수도권_유입_비중(sidos: { 시도명: string; 관외_유입_재원일수: number }[]): number {
  const 전체 = sidos.reduce((acc, d) => acc + d.관외_유입_재원일수, 0);
  const 수도권 = sidos
    .filter((d) => d.시도명.startsWith('서울') || d.시도명.startsWith('경기'))
    .reduce((acc, d) => acc + d.관외_유입_재원일수, 0);
  return 전체 > 0 ? Math.round((수도권 / 전체) * 1000) / 10 : 0;
}

export function analyze_patient_flow_query(user_query: string): 질의_응답_결과 {
  const q = user_query.trim().toLowerCase();
  const limit = parse_query_limit(user_query, 10, 70);

  // 1. [핵심 질문] 중진료권별 유출 Top N 및 유출 인구수
  if (
    (q.includes('중진료권') || q.includes('권역')) &&
    (q.includes('유출') || q.includes('빠져') || q.includes('관외'))
  ) {
    const all_mids = get_all_mid_zones_flow_stats();
    // 유출률 기준 정렬 (또는 유출 인구 기준)
    const sorted = [...all_mids]
      .sort((a, b) => b.유출률 - a.유출률)
      .slice(0, limit)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const top1 = sorted[0];
    const top3_names = sorted.slice(0, 3).map((d) => `${d.중진료권명}(${d.유출률}%)`).join(', ');
    const total_outflow_days = sorted.reduce((sum, d) => sum + d.유출_재원일수, 0);

    return {
      query: user_query,
      category: '중진료권_유출',
      title: `전국 70개 중진료권별 환자 유출률 Top ${sorted.length} 및 유출 재원일수`,
      summary: `전국 70개 중진료권 전수 분석 결과, 환자 관외 유출률 1위는 **${top1.중진료권명}**(${top1.유출률}%, 유출 재원일수 ${format_number_comma(top1.유출_재원일수)}일)이며, 상위 3개 권역은 **${top3_names}** 순입니다. 상위 ${sorted.length}개 권역의 관외 유출 재원일수 합계는 **${format_number_comma(total_outflow_days)}일**입니다 (2024 입원 재원일수 기준).`,
      insights: [
        `🚨 **최고 취약 권역**: ${top1.중진료권명}(${top1.시도명})은 전체 의료이용의 ${top1.유출률}%가 관외로 유출되며, 주로 [${top1.주요_유출_목적지.join(', ')}]으로 환자가 유출되고 있습니다.`,
        `📊 **유출 규모**: 상위 ${sorted.length}개 권역 주민의 입원 재원일수 중 관외 유출분은 합계 ${format_number_comma(total_outflow_days)}일입니다. (재원일수 기준이며 환자 수가 아님)`,
        `💡 **상위 3개 권역**: ${top3_names}`,
      ],
      data_type: '중진료권',
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '중진료권명', label: '중진료권명', align: 'left' },
        { key: '시도명', label: '시·도', align: 'center' },
        { key: '인구수_fmt', label: '권역 인구수', align: 'right' },
        { key: '유출률_fmt', label: '관외 유출률', align: 'right' },
        { key: '유출_재원일수_fmt', label: '유출 재원일수', align: 'right' },
        { key: '주요_유출지_fmt', label: '주요 유출 목적지 (Top 3)', align: 'left' },
      ],
      table_rows: sorted.map((d) => ({
        rank: d.rank,
        중진료권명: d.중진료권명,
        시도명: d.시도명,
        인구수: d.인구수,
        인구수_fmt: `${format_number_comma(d.인구수)}명`,
        유출률: d.유출률,
        유출률_fmt: `${d.유출률}%`,
        유출_재원일수: d.유출_재원일수,
        유출_재원일수_fmt: `${format_number_comma(d.유출_재원일수)}일`,
        주요_유출지_fmt: d.주요_유출_목적지.join(', ') || '인접 권역',
      })),
      chart_data: sorted.map((d) => ({
        name: d.중진료권명,
        value1: d.유출률,
        value2: Math.round(d.유출_재원일수 / 1000), // 천일 단위
        label1: '유출률 (%)',
        label2: '유출 재원일수 (천일)',
      })),
    };
  }

  // 2. 중진료권별 유입 Top N
  if (
    (q.includes('중진료권') || q.includes('권역')) &&
    (q.includes('유입') || q.includes('흡수') || q.includes('들어'))
  ) {
    const all_mids = get_all_mid_zones_flow_stats();
    const sorted = [...all_mids]
      .sort((a, b) => b.관외_유입_재원일수 - a.관외_유입_재원일수)
      .slice(0, limit)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const top1 = sorted[0];

    return {
      query: user_query,
      category: '중진료권_유입',
      title: `전국 70개 중진료권별 타지역 환자 유입량 Top ${sorted.length}`,
      summary: `타지역 환자가 가장 많이 유입되는 중진료권 1위는 **${top1.중진료권명}**(${top1.시도명})으로, 관외 유입 재원일수가 **${format_number_comma(top1.관외_유입_재원일수)}일**에 달합니다. 수도권 상급종합병원 밀집 권역과 지방 대도시 중추 권역으로 환자 쏠림이 뚜렷합니다.`,
      insights: [
        `🏥 **의료자원 블랙홀 권역**: 상위 유입 권역은 우수한 상급종합병원 및 필수의료 전문 인프라가 집중되어 전국 및 인접 권역 환자를 대거 흡수하고 있습니다.`,
        `🔄 **주요 유입 출처**: ${top1.중진료권명}의 경우 주로 [${top1.주요_유입_출처지.join(', ')}] 지역 환자가 대거 유입됩니다.`,
      ],
      data_type: '중진료권',
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '중진료권명', label: '중진료권명', align: 'left' },
        { key: '시도명', label: '시·도', align: 'center' },
        { key: '총_유입_fmt', label: '총 이용일수', align: 'right' },
        { key: '관외_유입_fmt', label: '관외 유입일수', align: 'right' },
        { key: '유입률_fmt', label: '관외 유입비율', align: 'right' },
        { key: '주요_유입지_fmt', label: '주요 유입 출처지 (Top 3)', align: 'left' },
      ],
      table_rows: sorted.map((d) => ({
        rank: d.rank,
        중진료권명: d.중진료권명,
        시도명: d.시도명,
        총_유입_fmt: `${format_number_comma(d.총_유입_재원일수)}일`,
        관외_유입_fmt: `${format_number_comma(d.관외_유입_재원일수)}일`,
        유입률_fmt: `${d.관외_유입률}%`,
        주요_유입지_fmt: d.주요_유입_출처지.join(', ') || '인접 시군구',
      })),
      chart_data: sorted.map((d) => ({
        name: d.중진료권명,
        value1: Math.round(d.관외_유입_재원일수 / 10000), // 만일 단위
        label1: '관외 유입일수 (만 일)',
      })),
    };
  }

  // 3. 시도별 유출/유입
  if (q.includes('시도') || q.includes('시·도') || q.includes('광역시') || q.includes('도별')) {
    const all_sidos = get_all_sido_flow_stats();
    const is_inflow = q.includes('유입');
    const sido_limit = Math.min(limit, 17);
    const sorted = [...all_sidos]
      .sort((a, b) => (is_inflow ? b.관외_유입_재원일수 - a.관외_유입_재원일수 : b.유출률 - a.유출률))
      .slice(0, sido_limit)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const top1 = sorted[0];

    return {
      query: user_query,
      category: '시도_유출입',
      title: is_inflow ? `전국 17개 시·도별 타지역 환자 유입량 순위 Top ${sorted.length}` : `전국 17개 시·도별 환자 관외 유출률 Top ${sorted.length}`,
      summary: is_inflow
        ? `전국 17개 시·도 중 타지역 환자 유입 1위는 **${top1.시도명}**이며, 연간 **${format_number_comma(top1.관외_유입_재원일수)}일**의 관외 환자 진료가 발생했습니다.`
        : `전국 17개 시·도 중 환자 관외 유출률 1위는 **${top1.시도명}**(${top1.유출률}%, 유출 재원일수 ${format_number_comma(top1.유출_재원일수)}일)입니다.`,
      insights: [
        `📊 **유출률 상위 3개 시·도**: ${[...all_sidos].sort((a, b) => b.유출률 - a.유출률).slice(0, 3).map((d) => `${d.시도명}(${d.유출률}%)`).join(', ')}`,
        `🏥 **서울·경기 유입 비중**: 전국 관외 유입 재원일수의 ${수도권_유입_비중(all_sidos)}% (2024 입원 재원일수 기준)`,
      ],
      data_type: '시도',
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '시도명', label: '시·도', align: 'left' },
        { key: '인구수_fmt', label: '총 인구수', align: 'right' },
        { key: '유출률_fmt', label: '관외 유출률', align: 'right' },
        { key: '관외_유입_fmt', label: '타지역 유입일수', align: 'right' },
      ],
      table_rows: sorted.map((d) => ({
        rank: d.rank,
        시도명: d.시도명,
        인구수_fmt: `${format_number_comma(d.인구수)}명`,
        유출률_fmt: `${d.유출률}%`,
        관외_유입_fmt: `${format_number_comma(d.관외_유입_재원일수)}일`,
      })),
      chart_data: sorted.map((d) => ({
        name: d.시도명,
        value1: is_inflow ? Math.round(d.관외_유입_재원일수 / 10000) : d.유출률,
        label1: is_inflow ? '유입일수 (만 일)' : '유출률 (%)',
      })),
    };
  }

  // 4. 특정 지자체(시군구) 검색
  const matched_sgg_key = Object.keys(환자_유출입_2024_데이터).find((sgg) => q.includes(sgg.toLowerCase()));
  if (matched_sgg_key) {
    const sgg_data = 환자_유출입_2024_데이터[matched_sgg_key];
    const top_outflows = (sgg_data.outflow_top || []).filter((d) => !d.is_self).slice(0, Math.min(limit, 10));
    const top_inflows = (sgg_data.inflow_top || []).filter((d) => !d.is_self).slice(0, Math.min(limit, 10));

    return {
      query: user_query,
      category: '특정지역_상세',
      title: `${sgg_data.sido} ${sgg_data.sgg} 환자 의료이용 유출입 상세 분석`,
      summary: `**${sgg_data.sgg}**의 자체충족률(RI)은 **${sgg_data.ri}%**, 관외 유출률은 **${sgg_data.outflow_rate}%**입니다. 총 재원일수 ${format_number_comma(sgg_data.total_days)}일 중 관외 유출일수는 ${format_number_comma(sgg_data.total_days - sgg_data.self_days)}일입니다 (2024 입원 재원일수 기준).`,
      insights: [
        `📍 **소속 권역**: ${sgg_data.sido} ${sgg_data.mid} 중진료권 소속`,
        `🚗 **최대 유출지**: 1위 유출지는 **${top_outflows[0]?.dest_sido} ${top_outflows[0]?.dest_sgg}**(${top_outflows[0]?.pct}%, ${format_number_comma(top_outflows[0]?.days || 0)}일)입니다.`,
        `📥 **타지역 유입**: 타지역 환자 ${format_number_comma(sgg_data.outsider_inflow_days)}일이 유입되며, 1위 유입지는 **${top_inflows[0]?.orig_sido} ${top_inflows[0]?.orig_sgg}**(${top_inflows[0]?.pct}%)입니다.`,
      ],
      data_type: '지역상세',
      table_columns: [
        { key: 'rank', label: '순위', align: 'center' },
        { key: '구분', label: '유형', align: 'center' },
        { key: '지역명', label: '상대 지자체', align: 'left' },
        { key: '재원일수_fmt', label: '재원일수', align: 'right' },
        { key: '점유율_fmt', label: '점유율(%)', align: 'right' },
      ],
      table_rows: [
        ...top_outflows.map((d, i) => ({
          rank: i + 1,
          구분: '관외 유출',
          지역명: `${d.dest_sido} ${d.dest_sgg}`,
          재원일수_fmt: `${format_number_comma(d.days)}일`,
          점유율_fmt: `${d.pct}%`,
        })),
        ...top_inflows.map((d, i) => ({
          rank: i + 1,
          구분: '타지역 유입',
          지역명: `${d.orig_sido} ${d.orig_sgg}`,
          재원일수_fmt: `${format_number_comma(d.days)}일`,
          점유율_fmt: `${d.pct}%`,
        })),
      ],
      chart_data: top_outflows.map((d) => ({
        name: d.dest_sgg,
        value1: d.pct,
        label1: '유출 점유율 (%)',
      })),
    };
  }

  // 5. 시군구별 유출 순위 Top N (기본 폴백)
  const all_sggs = get_all_sgg_flow_stats();
  const sorted = [...all_sggs]
    .sort((a, b) => b.유출률 - a.유출률)
    .slice(0, limit)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const top1 = sorted[0];

  return {
    query: user_query,
    category: '시군구_유출입',
    title: `전국 228개 시·군·구별 환자 관외 유출률 Top ${sorted.length}`,
    summary: `전국 시·군·구 중 관외 유출률 1위 지자체는 **${top1.시도명} ${top1.시군구명}**(${top1.유출률}%, 유출 재원일수 ${format_number_comma(top1.유출_재원일수)}일)입니다.`,
    insights: [
      `📊 **유출률 범위**: 상위 ${sorted.length}개 지자체의 관외 유출률은 ${sorted[sorted.length - 1].유출률}%~${top1.유출률}%입니다 (2024 입원 재원일수 기준).`,
      `💡 **지역거점 공공병원 확충 필요**: 공공의료 취약지 파견 및 지역책임의료기관과의 전원 이송 네트워크 구축이 필수적입니다.`,
    ],
    data_type: '시군구',
    table_columns: [
      { key: 'rank', label: '순위', align: 'center' },
      { key: '시군구명', label: '시·군·구', align: 'left' },
      { key: '시도명', label: '시·도', align: 'center' },
      { key: '중진료권명', label: '중진료권', align: 'center' },
      { key: '유출률_fmt', label: '관외 유출률', align: 'right' },
      { key: '유출_재원일수_fmt', label: '유출 재원일수', align: 'right' },
    ],
    table_rows: sorted.map((d) => ({
      rank: d.rank,
      시군구명: d.시군구명,
      시도명: d.시도명,
      중진료권명: d.중진료권명,
      유출률_fmt: `${d.유출률}%`,
      유출_재원일수_fmt: `${format_number_comma(d.유출_재원일수)}일`,
    })),
    chart_data: sorted.map((d) => ({
      name: d.시군구명,
      value1: d.유출률,
      label1: '유출률 (%)',
    })),
  };
}
