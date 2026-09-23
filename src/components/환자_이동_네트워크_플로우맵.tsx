'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Layers,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  GitBranch,
  Building2,
  TrendingUp,
  Activity,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';
import { 시군구_환자_유출입_데이터 } from '@/lib/환자_유출입_데이터셋';
import { format_number_comma } from '@/lib/유틸리티';

// SSR 방지를 위한 Leaflet 플로우맵 동적 임포트
const DynamicFlowMap = dynamic(
  () => import('./환자_이동_네트워크_플로우맵_내부'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
        <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          환자 이동 네트워크 공간 플로우맵 로딩 중...
        </p>
      </div>
    ),
  }
);

interface 환자_이동_네트워크_플로우맵_속성 {
  flow_data: 시군구_환자_유출입_데이터;
  on_select_sgg?: (sgg_name: string) => void;
}

export default function 환자_이동_네트워크_플로우맵({
  flow_data,
  on_select_sgg,
}: 환자_이동_네트워크_플로우맵_속성) {
  // 메인 뷰 모드: 'map' (GIS 아크 플로우맵) vs 'sankey' (3단계 생키 다이어그램)
  const [view_type, set_view_type] = useState<'map' | 'sankey'>('map');

  // 플로우 모드: 'all' | 'outflow' | 'inflow'
  const [flow_mode, set_flow_mode] = useState<'all' | 'outflow' | 'inflow'>('all');

  // 호버 하이라이트 상태
  const [highlighted_arc_id, set_highlighted_arc_id] = useState<string | null>(null);
  const [hovered_sankey_node, set_hovered_sankey_node] = useState<string | null>(null);

  // 생키 다이어그램 노드 및 흐름 데이터 계산
  const sankey_data = useMemo(() => {
    const total = flow_data.total_days || 1;
    const svg_h = 420;
    const padding = 14;

    // 1열: 출발지 노드 (1개)
    const col0_nodes = [
      {
        id: 'origin',
        label: `${flow_data.sgg} 거주 환자`,
        sub: `${format_number_comma(flow_data.total_days)}일 (100%)`,
        days: flow_data.total_days,
        pct: 100,
        color: '#2563eb',
        y: 30,
        h: svg_h - 60,
      },
    ];

    // 2열: 치료 지역 (관내 + 상위 유출지 4개 + 기타)
    const dest_list = flow_data.outflow_top.slice(0, 5);
    const accounted_days = dest_list.reduce((acc, cur) => acc + cur.days, 0);
    const other_days = Math.max(flow_data.total_days - accounted_days, 0);

    const col1_raw = [
      ...dest_list.map((item, idx) => ({
        id: `dest-${item.dest_sgg}`,
        label: item.is_self ? `${item.dest_sgg} (관내)` : `${item.dest_sido.substring(0, 2)} ${item.dest_sgg}`,
        sub: `${format_number_comma(item.days)}일 (${item.pct}%)`,
        days: item.days,
        pct: item.pct,
        is_self: item.is_self,
        color: item.is_self ? '#10b981' : idx === 1 ? '#f43f5e' : idx === 2 ? '#fb7185' : '#f59e0b',
      })),
    ];
    if (other_days > 0) {
      col1_raw.push({
        id: 'dest-other',
        label: '기타 시군구',
        sub: `${format_number_comma(other_days)}일 (${((other_days / total) * 100).toFixed(1)}%)`,
        days: other_days,
        pct: Number(((other_days / total) * 100).toFixed(1)),
        is_self: false,
        color: '#94a3b8',
      });
    }

    // 2열 Y 좌표 및 높이 계산
    const col1_usable_h = svg_h - 60 - padding * (col1_raw.length - 1);
    let cur_y1 = 30;
    const col1_nodes = col1_raw.map((node) => {
      const h = Math.max((node.days / total) * col1_usable_h, 18);
      const res = { ...node, y: cur_y1, h };
      cur_y1 += h + padding;
      return res;
    });

    // 3열: 의료기관 종별 (상급종합 / 종합병원 / 병원 / 의원)
    const ht = flow_data.hospital_types;
    const col2_raw = [
      {
        id: 'tier-tertiary',
        label: '상급종합병원',
        sub: `${format_number_comma(ht.tertiary_days)}일 (${ht.tertiary_pct}%)`,
        days: ht.tertiary_days,
        pct: ht.tertiary_pct,
        color: '#8b5cf6',
      },
      {
        id: 'tier-general',
        label: '종합병원',
        sub: `${format_number_comma(ht.general_days)}일 (${ht.general_pct}%)`,
        days: ht.general_days,
        pct: ht.general_pct,
        color: '#3b82f6',
      },
      {
        id: 'tier-hospital',
        label: '병원·요양병원',
        sub: `${format_number_comma(ht.hospital_days)}일 (${ht.hospital_pct}%)`,
        days: ht.hospital_days,
        pct: ht.hospital_pct,
        color: '#06b6d4',
      },
      {
        id: 'tier-clinic',
        label: '의원급',
        sub: `${format_number_comma(ht.clinic_days)}일 (${ht.clinic_pct}%)`,
        days: ht.clinic_days,
        pct: ht.clinic_pct,
        color: '#10b981',
      },
    ].filter((x) => x.days > 0 || x.pct > 0);

    const col2_usable_h = svg_h - 60 - padding * (col2_raw.length - 1);
    let cur_y2 = 30;
    const col2_nodes = col2_raw.map((node) => {
      const h = Math.max((node.days / total) * col2_usable_h, 20);
      const res = { ...node, y: cur_y2, h };
      cur_y2 += h + padding;
      return res;
    });

    // 1열 ➔ 2열 연결 링크(Ribbon) 생성
    let link_y0 = col0_nodes[0].y;
    const links_0_to_1 = col1_nodes.map((n1) => {
      const ribbon_h0 = (n1.days / total) * col0_nodes[0].h;
      const y0_start = link_y0;
      link_y0 += ribbon_h0;

      return {
        id: `link-0-${n1.id}`,
        source_id: 'origin',
        target_id: n1.id,
        y0_start,
        y0_end: y0_start + ribbon_h0,
        y1_start: n1.y,
        y1_end: n1.y + n1.h,
        color: n1.color,
        days: n1.days,
        pct: n1.pct,
        label: `${col0_nodes[0].label} ➔ ${n1.label}: ${format_number_comma(n1.days)}일 (${n1.pct}%)`,
      };
    });

    // 2열 ➔ 3열 연결 링크(Ribbon) 생성
    const links_1_to_2: any[] = [];
    col1_nodes.forEach((n1) => {
      // 각 치료지역에서 종별 비율로 3열로 분배
      let n1_sub_y = n1.y;
      col2_nodes.forEach((n2) => {
        const share = n2.pct / 100;
        const link_days = Math.round(n1.days * share);
        if (link_days <= 0) return;

        const ribbon_h1 = Math.max(n1.h * share, 2);
        const y1_s = n1_sub_y;
        n1_sub_y += ribbon_h1;

        // n2 내 위치
        const y2_s = n2.y + ((n1.days / total) * n2.h * 0.5);
        const y2_e = y2_s + Math.max(ribbon_h1 * 0.8, 2);

        links_1_to_2.push({
          id: `link-${n1.id}-${n2.id}`,
          source_id: n1.id,
          target_id: n2.id,
          y1_start: y1_s,
          y1_end: y1_s + ribbon_h1,
          y2_start: y2_s,
          y2_end: y2_e,
          color: n2.color,
          days: link_days,
          label: `${n1.label} ➔ ${n2.label}: 약 ${format_number_comma(link_days)}일`,
        });
      });
    });

    return {
      col0_nodes,
      col1_nodes,
      col2_nodes,
      links_0_to_1,
      links_1_to_2,
    };
  }, [flow_data]);

  // 최다 유출지 및 유입지 계산
  const top_outflow = useMemo(
    () => flow_data.outflow_top.find((x) => !x.is_self) || flow_data.outflow_top[0],
    [flow_data]
  );
  const top_inflow = useMemo(
    () => flow_data.inflow_top.find((x) => !x.is_self) || flow_data.inflow_top[0],
    [flow_data]
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
      {/* 1. 상단 타이틀 및 모드 스위처 바 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              공간 네트워크 AI 시각화
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              2024년 환자 이동 매트릭스(OD) 62,502건 반영
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{flow_data.sgg} 환자 이동 플로우맵 & 생키 다이어그램</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            관내 환자의 외부 의료기관 유출 경로와 타지역 환자의 유입 분담 구조를 공간 및 계층 다이어그램으로 정밀 진단합니다.
          </p>
        </div>

        {/* 뷰 모드 탭 (플로우맵 vs 생키 다이어그램) */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <button
            onClick={() => set_view_type('map')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              view_type === 'map'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            GIS 공간 플로우맵
          </button>
          <button
            onClick={() => set_view_type('sankey')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              view_type === 'sankey'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            3단계 환자 흐름도 (Sankey)
          </button>
        </div>
      </div>

      {/* 2. 핵심 지표 퀵 바 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            총 입원 재원일수
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {format_number_comma(flow_data.total_days)}일
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            자체충족(RI): <strong className="text-blue-600">{flow_data.ri}%</strong>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
          <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            최다 유출지 (1순위)
          </div>
          <div className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">
            {top_outflow?.dest_sido} {top_outflow?.dest_sgg}
          </div>
          <div className="text-[11px] text-rose-600/80">
            {format_number_comma(top_outflow?.days || 0)}일 ({top_outflow?.pct}%)
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            최다 유입지 (1순위)
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
            {top_inflow?.orig_sido} {top_inflow?.orig_sgg}
          </div>
          <div className="text-[11px] text-emerald-600/80">
            {format_number_comma(top_inflow?.days || 0)}일 ({top_inflow?.pct}%)
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
          <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            종합병원급 이상 의존도
          </div>
          <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-0.5">
            {(
              flow_data.hospital_types.tertiary_pct +
              flow_data.hospital_types.general_pct
            ).toFixed(1)}%
          </div>
          <div className="text-[11px] text-purple-600/80">
            상급종합 {flow_data.hospital_types.tertiary_pct}% + 종합 {flow_data.hospital_types.general_pct}%
          </div>
        </div>
      </div>

      {/* 3. 메인 콘텐츠 영역 (GIS 플로우맵 or 생키 다이어그램) */}
      {view_type === 'map' ? (
        <div className="space-y-3">
          {/* 플로우맵 필터 바 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => set_flow_mode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  flow_mode === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                전체 네트워크 ({flow_data.outflow_top.length + flow_data.inflow_top.length}개 경로)
              </button>
              <button
                onClick={() => set_flow_mode('outflow')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  flow_mode === 'outflow'
                    ? 'bg-rose-500 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                관외 유출만 (Outflow)
              </button>
              <button
                onClick={() => set_flow_mode('inflow')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  flow_mode === 'inflow'
                    ? 'bg-emerald-500 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                타지역 유입만 (Inflow)
              </button>
            </div>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline-block">
              곡선을 마우스로 호버하면 세부 재원일수와 응급/투석 유출량이 표시됩니다.
            </span>
          </div>

          {/* Leaflet Dynamic Arc Map */}
          <DynamicFlowMap
            flow_data={flow_data}
            flow_mode={flow_mode}
            highlighted_arc_id={highlighted_arc_id}
            on_hover_arc={set_highlighted_arc_id}
          />
        </div>
      ) : (
        /* 뷰 2: 3단계 생키 다이어그램 (Sankey Flow Diagram) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-6 font-semibold">
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Step 1. 환자 거주지
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Step 2. 치료 의료기관 소재지
              </span>
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Step 3. 의료기관 종별
              </span>
            </div>
            <span>마우스 호버 시 해당 흐름(Ribbon)의 상세 재원일수가 하이라이트됩니다.</span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full bg-[#fcfdfe] dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 overflow-x-auto shadow-inner">
            <svg
              viewBox="0 0 920 420"
              className="w-full h-auto min-w-[760px] select-none"
              style={{ maxHeight: '460px' }}
            >
              <defs>
                <linearGradient id="grad-blue-amber" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="grad-amber-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* 1. 1열 ➔ 2열 연결 리본 패스 */}
              {sankey_data.links_0_to_1.map((link) => {
                const is_hovered =
                  hovered_sankey_node === link.target_id ||
                  hovered_sankey_node === link.source_id;
                const x0 = 170;
                const x1 = 390;
                const midX = (x0 + x1) / 2;

                const path_d = `
                  M ${x0} ${link.y0_start}
                  C ${midX} ${link.y0_start}, ${midX} ${link.y1_start}, ${x1} ${link.y1_start}
                  L ${x1} ${link.y1_end}
                  C ${midX} ${link.y1_end}, ${midX} ${link.y0_end}, ${x0} ${link.y0_end}
                  Z
                `;

                return (
                  <path
                    key={link.id}
                    d={path_d}
                    fill={link.color}
                    fillOpacity={is_hovered ? 0.85 : 0.38}
                    stroke={link.color}
                    strokeWidth={is_hovered ? 1.5 : 0.5}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => set_hovered_sankey_node(link.target_id)}
                    onMouseLeave={() => set_hovered_sankey_node(null)}
                  >
                    <title>{link.label}</title>
                  </path>
                );
              })}

              {/* 2. 2열 ➔ 3열 연결 리본 패스 */}
              {sankey_data.links_1_to_2.map((link) => {
                const is_hovered =
                  hovered_sankey_node === link.source_id ||
                  hovered_sankey_node === link.target_id;
                const x1 = 570;
                const x2 = 740;
                const midX = (x1 + x2) / 2;

                const path_d = `
                  M ${x1} ${link.y1_start}
                  C ${midX} ${link.y1_start}, ${midX} ${link.y2_start}, ${x2} ${link.y2_start}
                  L ${x2} ${link.y2_end}
                  C ${midX} ${link.y2_end}, ${midX} ${link.y1_end}, ${x1} ${link.y1_end}
                  Z
                `;

                return (
                  <path
                    key={link.id}
                    d={path_d}
                    fill={link.color}
                    fillOpacity={is_hovered ? 0.8 : 0.28}
                    stroke={link.color}
                    strokeWidth={is_hovered ? 1.5 : 0.5}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => set_hovered_sankey_node(link.source_id)}
                    onMouseLeave={() => set_hovered_sankey_node(null)}
                  >
                    <title>{link.label}</title>
                  </path>
                );
              })}

              {/* 3. Level 0 노드 (출발지 노드) */}
              {sankey_data.col0_nodes.map((node) => (
                <g
                  key={node.id}
                  transform={`translate(30, ${node.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => set_hovered_sankey_node(node.id)}
                  onMouseLeave={() => set_hovered_sankey_node(null)}
                >
                  <rect
                    width="140"
                    height={node.h}
                    rx="10"
                    fill={node.color}
                    className="shadow-sm"
                  />
                  <text
                    x="70"
                    y={node.h / 2 - 8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontWeight="bold"
                    fontSize="13"
                  >
                    {node.label}
                  </text>
                  <text
                    x="70"
                    y={node.h / 2 + 12}
                    textAnchor="middle"
                    fill="#ffffff"
                    opacity="0.9"
                    fontSize="11"
                  >
                    {node.sub}
                  </text>
                </g>
              ))}

              {/* 4. Level 1 노드 (치료 지역 노드들) */}
              {sankey_data.col1_nodes.map((node) => (
                <g
                  key={node.id}
                  transform={`translate(390, ${node.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => set_hovered_sankey_node(node.id)}
                  onMouseLeave={() => set_hovered_sankey_node(null)}
                >
                  <rect
                    width="180"
                    height={node.h}
                    rx="8"
                    fill={node.color}
                    fillOpacity="0.9"
                    stroke={hovered_sankey_node === node.id ? '#ffffff' : 'none'}
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <text
                    x="90"
                    y={node.h / 2 - (node.h > 35 ? 7 : 0)}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontWeight="bold"
                    fontSize={node.h > 30 ? '12' : '10'}
                  >
                    {node.label}
                  </text>
                  {node.h > 35 && (
                    <text
                      x="90"
                      y={node.h / 2 + 11}
                      textAnchor="middle"
                      fill="#ffffff"
                      opacity="0.9"
                      fontSize="10"
                    >
                      {node.sub}
                    </text>
                  )}
                </g>
              ))}

              {/* 5. Level 2 노드 (의료기관 종별 노드들) */}
              {sankey_data.col2_nodes.map((node) => (
                <g
                  key={node.id}
                  transform={`translate(740, ${node.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => set_hovered_sankey_node(node.id)}
                  onMouseLeave={() => set_hovered_sankey_node(null)}
                >
                  <rect
                    width="150"
                    height={node.h}
                    rx="8"
                    fill={node.color}
                    fillOpacity="0.9"
                    stroke={hovered_sankey_node === node.id ? '#ffffff' : 'none'}
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <text
                    x="75"
                    y={node.h / 2 - (node.h > 35 ? 7 : 0)}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontWeight="bold"
                    fontSize={node.h > 30 ? '12' : '10'}
                  >
                    {node.label}
                  </text>
                  {node.h > 35 && (
                    <text
                      x="75"
                      y={node.h / 2 + 11}
                      textAnchor="middle"
                      fill="#ffffff"
                      opacity="0.9"
                      fontSize="10"
                    >
                      {node.sub}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* 4. 공간 네트워크 기반 정책적 통찰 브리핑 카드 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs sm:text-sm">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>네트워크 흐름 기반 의료취약지 정책적 시사점</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              ① 인접 배후 거점도시 의존 현황
            </strong>
            {flow_data.sgg}은 자체충족률(RI)이 {flow_data.ri}%로, 최다 유출지인{' '}
            <strong>
              {top_outflow?.dest_sido} {top_outflow?.dest_sgg}({top_outflow?.pct}%)
            </strong>
            로의 원정 진료 의존성이 매우 높게 형성되어 있습니다.
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              ② 인근 군 단위 취약지 수용 기능
            </strong>
            반면 관내 의료기관은 인근 취약지역인{' '}
            <strong>
              {top_inflow?.orig_sgg}({top_inflow?.pct}%)
            </strong>{' '}
            환자들을 흡수하며 소지역 거점의 안전망 기능을 병행하고 있습니다.
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block mb-1">
              ③ 공공병원 인프라 확충 타당성
            </strong>
            종합병원급 이상 유출 비중이{' '}
            <strong>
              {(
                flow_data.hospital_types.tertiary_pct +
                flow_data.hospital_types.general_pct
              ).toFixed(1)}
              %
            </strong>
            에 달하므로, 관내 지방의료원의 중증·응급 시설 투자(이전신축, 혈액투석실 확대 등)의 근거가 확고합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
