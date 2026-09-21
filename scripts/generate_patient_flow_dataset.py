# -*- coding: utf-8 -*-
"""
환자 의료이용 유출입(OD Matrix) 2024년 실데이터 추출 및 TypeScript 데이터셋 생성 스크립트
참고자료: 의료이용+유출입+데이터_2019-2024_260604 (1).xlsx
"""
import openpyxl
import json
import os
import sys
import time

excel_path = r"C:\Users\KITC\Desktop\프로토타입\참고자료\의료이용+유출입+데이터_2019-2024_260604 (1).xlsx"
output_ts_path = r"c:\Users\KITC\Desktop\헬스맵2\src\lib\환자_유출입_데이터셋.ts"

print("Excel 로딩 시작:", excel_path)
start_time = time.time()
wb = openpyxl.load_workbook(excel_path, read_only=True)
ws = wb["2024년"]

origins = {}
destinations = {}

for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i < 3:
        continue
    orig_code, orig_sido, orig_mid, orig_sgg = row[0], row[1], row[2], row[3]
    dest_code, dest_sido, dest_mid, dest_sgg = row[4], row[5], row[6], row[7]
    
    total_days = row[8] or 0
    tertiary = row[11] or 0
    general = row[12] or 0
    hospital = row[13] or 0
    clinic = (row[18] or 0) + (row[19] or 0) + (row[20] or 0)
    
    int_med = row[25] or 0  # 내과
    surg = row[26] or 0     # 외과
    obgyn = row[27] or 0    # 산부인과
    ped = row[28] or 0      # 소아청소년과
    ortho = row[29] or 0    # 정형외과
    
    er = row[35] or 0       # 응급실
    deliv = row[36] or 0    # 분만실
    icu = row[40] or 0      # 중환자실
    dialysis = row[41] or 0 # 인공신장실

    if orig_sgg not in origins:
        origins[orig_sgg] = {
            'code': orig_code, 'sido': orig_sido, 'mid': orig_mid, 'sgg': orig_sgg,
            'total_days': 0, 'self_days': 0,
            'tertiary_days': 0, 'general_days': 0, 'hospital_days': 0, 'clinic_days': 0,
            'dialysis_total': 0, 'dialysis_self': 0,
            'er_total': 0, 'er_self': 0,
            'deliv_total': 0, 'deliv_self': 0,
            'icu_total': 0, 'icu_self': 0,
            'ped_total': 0, 'ped_self': 0,
            'int_med_total': 0, 'int_med_self': 0,
            'surg_total': 0, 'surg_self': 0,
            'obgyn_total': 0, 'obgyn_self': 0,
            'ortho_total': 0, 'ortho_self': 0,
            'dests': []
        }
    o = origins[orig_sgg]
    o['total_days'] += total_days
    o['tertiary_days'] += tertiary
    o['general_days'] += general
    o['hospital_days'] += hospital
    o['clinic_days'] += clinic
    o['dialysis_total'] += dialysis
    o['er_total'] += er
    o['deliv_total'] += deliv
    o['icu_total'] += icu
    o['ped_total'] += ped
    o['int_med_total'] += int_med
    o['surg_total'] += surg
    o['obgyn_total'] += obgyn
    o['ortho_total'] += ortho

    is_self = (orig_sgg == dest_sgg)
    if is_self:
        o['self_days'] += total_days
        o['dialysis_self'] += dialysis
        o['er_self'] += er
        o['deliv_self'] += deliv
        o['icu_self'] += icu
        o['ped_self'] += ped
        o['int_med_self'] += int_med
        o['surg_self'] += surg
        o['obgyn_self'] += obgyn
        o['ortho_self'] += ortho

    if total_days > 0:
        o['dests'].append({
            'dest_sgg': dest_sgg, 'dest_sido': dest_sido, 'dest_mid': dest_mid,
            'days': total_days, 'is_self': is_self,
            'tertiary_days': tertiary, 'general_days': general,
            'dialysis_days': dialysis, 'er_days': er
        })

    if dest_sgg not in destinations:
        destinations[dest_sgg] = {
            'total_inflow': 0, 'self_days': 0, 'origins': []
        }
    d = destinations[dest_sgg]
    d['total_inflow'] += total_days
    if is_self:
        d['self_days'] += total_days
    if total_days > 0:
        d['origins'].append({
            'orig_sgg': orig_sgg, 'orig_sido': orig_sido, 'orig_mid': orig_mid,
            'days': total_days, 'is_self': is_self
        })

print(f"전체 {i}개 행 파싱 완료 ({time.time() - start_time:.2f}초)")

# 결과 구조화
result = {}
for sgg, o in origins.items():
    tot = o['total_days'] or 1
    self_days = o['self_days']
    ri = round(self_days / tot * 100, 2)
    
    sorted_dests = sorted(o['dests'], key=lambda x: x['days'], reverse=True)
    # top 8 유출지
    outflow_top = []
    for dst in sorted_dests[:8]:
        outflow_top.append({
            'dest_sgg': dst['dest_sgg'],
            'dest_sido': dst['dest_sido'],
            'dest_mid': dst['dest_mid'],
            'days': dst['days'],
            'pct': round(dst['days'] / tot * 100, 1),
            'is_self': dst['is_self'],
            'tertiary_days': dst['tertiary_days'],
            'general_days': dst['general_days'],
            'dialysis_days': dst['dialysis_days'],
            'er_days': dst['er_days']
        })
        
    d_info = destinations.get(sgg, {'total_inflow': 0, 'self_days': 0, 'origins': []})
    tot_inf = d_info['total_inflow'] or 1
    sorted_origs = sorted(d_info['origins'], key=lambda x: x['days'], reverse=True)
    inflow_top = []
    for org in sorted_origs[:8]:
        inflow_top.append({
            'orig_sgg': org['orig_sgg'],
            'orig_sido': org['orig_sido'],
            'orig_mid': org['orig_mid'],
            'days': org['days'],
            'pct': round(org['days'] / tot_inf * 100, 1),
            'is_self': org['is_self']
        })
        
    def get_top_outflow(field):
        non_self = [x for x in o['dests'] if not x['is_self'] and x[field] > 0]
        if not non_self:
            return None, 0
        best = max(non_self, key=lambda x: x[field])
        return best['dest_sgg'], best[field]

    d_out_sgg, d_out_days = get_top_outflow('dialysis_days')
    er_out_sgg, er_out_days = get_top_outflow('er_days')

    outsider_inflow = d_info['total_inflow'] - d_info['self_days']

    result[sgg] = {
        'code': o['code'],
        'sido': o['sido'],
        'sgg': o['sgg'],
        'mid': o['mid'],
        'total_days': o['total_days'],
        'self_days': o['self_days'],
        'ri': ri,
        'outflow_rate': round(100.0 - ri, 2),
        'hospital_types': {
            'tertiary_days': o['tertiary_days'],
            'general_days': o['general_days'],
            'hospital_days': o['hospital_days'],
            'clinic_days': o['clinic_days'],
            'tertiary_pct': round(o['tertiary_days'] / tot * 100, 1),
            'general_pct': round(o['general_days'] / tot * 100, 1),
            'hospital_pct': round(o['hospital_days'] / tot * 100, 1),
            'clinic_pct': round(o['clinic_days'] / tot * 100, 1)
        },
        'essential_care': {
            'dialysis': {
                'total': o['dialysis_total'],
                'self': o['dialysis_self'],
                'ri': round(o['dialysis_self'] / (o['dialysis_total'] or 1) * 100, 1),
                'top_outflow_sgg': d_out_sgg,
                'top_outflow_days': d_out_days
            },
            'er': {
                'total': o['er_total'],
                'self': o['er_self'],
                'ri': round(o['er_self'] / (o['er_total'] or 1) * 100, 1),
                'top_outflow_sgg': er_out_sgg,
                'top_outflow_days': er_out_days
            },
            'delivery': {
                'total': o['deliv_total'],
                'self': o['deliv_self'],
                'ri': round(o['deliv_self'] / (o['deliv_total'] or 1) * 100, 1)
            },
            'icu': {
                'total': o['icu_total'],
                'self': o['icu_self'],
                'ri': round(o['icu_self'] / (o['icu_total'] or 1) * 100, 1)
            }
        },
        'specialties': {
            'internal': {
                'total': o['int_med_total'],
                'self': o['int_med_self'],
                'ri': round(o['int_med_self'] / (o['int_med_total'] or 1) * 100, 1)
            },
            'surgery': {
                'total': o['surg_total'],
                'self': o['surg_self'],
                'ri': round(o['surg_self'] / (o['surg_total'] or 1) * 100, 1)
            },
            'pediatrics': {
                'total': o['ped_total'],
                'self': o['ped_self'],
                'ri': round(o['ped_self'] / (o['ped_total'] or 1) * 100, 1)
            },
            'obgyn': {
                'total': o['obgyn_total'],
                'self': o['obgyn_self'],
                'ri': round(o['obgyn_self'] / (o['obgyn_total'] or 1) * 100, 1)
            },
            'ortho': {
                'total': o['ortho_total'],
                'self': o['ortho_self'],
                'ri': round(o['ortho_self'] / (o['ortho_total'] or 1) * 100, 1)
            }
        },
        'outflow_top': outflow_top,
        'inflow_top': inflow_top,
        'total_inflow_days': d_info['total_inflow'],
        'outsider_inflow_days': outsider_inflow,
        'outsider_inflow_rate': round(outsider_inflow / tot_inf * 100, 1)
    }

ts_content = f"""/**
 * 국립중앙의료원 / 보건복지부 환자 의료이용 유출입 실데이터셋 (2024년 기준)
 * 데이터 출처: 의료이용+유출입+데이터_2019-2024_260604 (1).xlsx (72.6MB)
 * 전국 228개 시군구 환자의 이동 매트릭스(OD Matrix) 전수 분석 결과
 */

export interface 유출_목적지 {{
  dest_sgg: string;
  dest_sido: string;
  dest_mid: string;
  days: number;
  pct: number;
  is_self: boolean;
  tertiary_days: number;
  general_days: number;
  dialysis_days: number;
  er_days: number;
}}

export interface 유입_출처지 {{
  orig_sgg: string;
  orig_sido: string;
  orig_mid: string;
  days: number;
  pct: number;
  is_self: boolean;
}}

export interface 필수의료_유출입_지표 {{
  total: number;
  self: number;
  ri: number;
  top_outflow_sgg?: string | null;
  top_outflow_days?: number;
}}

export interface 진료과목_유출입_지표 {{
  total: number;
  self: number;
  ri: number;
}}

export interface 시군구_환자_유출입_데이터 {{
  code: number;
  sido: string;
  sgg: string;
  mid: string;
  total_days: number;
  self_days: number;
  ri: number;
  outflow_rate: number;
  hospital_types: {{
    tertiary_days: number;
    general_days: number;
    hospital_days: number;
    clinic_days: number;
    tertiary_pct: number;
    general_pct: number;
    hospital_pct: number;
    clinic_pct: number;
  }};
  essential_care: {{
    dialysis: 필수의료_유출입_지표;
    er: 필수의료_유출입_지표;
    delivery: 필수의료_유출입_지표;
    icu: 필수의료_유출입_지표;
  }};
  specialties: {{
    internal: 진료과목_유출입_지표;
    surgery: 진료과목_유출입_지표;
    pediatrics: 진료과목_유출입_지표;
    obgyn: 진료과목_유출입_지표;
    ortho: 진료과목_유출입_지표;
  }};
  outflow_top: 유출_목적지[];
  inflow_top: 유입_출처지[];
  total_inflow_days: number;
  outsider_inflow_days: number;
  outsider_inflow_rate: number;
}}

export const 환자_유출입_2024_데이터: Record<string, 시군구_환자_유출입_데이터> = {json.dumps(result, ensure_ascii=False, indent=2)};

/**
 * 특정 시군구의 유출입 데이터 조회 헬퍼
 * 시군구명(예: '영월군', '강원 영월군')으로 검색
 */
export function get_patient_flow_data(sgg_name: string): 시군구_환자_유출입_데이터 | undefined {{
  if (!sgg_name) return undefined;
  // 1. 정확한 매칭
  if (환자_유출입_2024_데이터[sgg_name]) {{
    return 환자_유출입_2024_데이터[sgg_name];
  }}
  // 2. 부분 일치 검색 ('영월군' in '강원특별자치도 영월군')
  for (const [key, data] of Object.entries(환자_유출입_2024_데이터)) {{
    if (sgg_name.includes(key) || key.includes(sgg_name)) {{
      return data;
    }}
  }}
  return undefined;
}}

/**
 * 전체 시군구 목록 반환
 */
export const 환자_유출입_시군구_목록 = Object.values(환자_유출입_2024_데이터).map(item => ({{
  code: item.code,
  sido: item.sido,
  sgg: item.sgg,
  mid: item.mid,
  ri: item.ri,
  outflow_rate: item.outflow_rate
}}));
"""

with open(output_ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"데이터셋 생성 성공! 파일 경로: {output_ts_path}")
file_size_kb = os.path.getsize(output_ts_path) / 1024
print(f"생성된 파일 크기: {file_size_kb:.1f} KB")
