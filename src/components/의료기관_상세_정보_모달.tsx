'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Phone,
  Globe,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Bed,
  Users,
  Activity,
  ShieldCheck,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Heart,
  Droplet,
  Brain,
  Baby,
  Sparkles,
  UserCheck,
  Calendar,
  Info,
} from 'lucide-react';
import {
  공공의료기관_상세_프로필,
  개별_의료서비스_상태,
  서비스_운영_상태,
} from '@/lib/의료서비스_검색_엔진';

interface 의료기관_상세_정보_모달_속성 {
  hospital: 공공의료기관_상세_프로필 | null;
  is_open: boolean;
  on_close: () => void;
  on_open_directions?: (hospital: 공공의료기관_상세_프로필) => void;
  data_go_kr_api_key?: string;
  on_open_data_modal?: () => void;
}

export const 의료기관_상세_정보_모달: React.FC<의료기관_상세_정보_모달_속성> = ({
  hospital,
  is_open,
  on_close,
  on_open_directions,
  data_go_kr_api_key,
  on_open_data_modal,
}) => {
  const [active_tab, setActive_tab] = useState<'info' | 'services' | 'resources' | 'public_role' | 'location'>('info');
  const [is_copied, setIs_copied] = useState(false);

  useEffect(() => {
    const handle_keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && is_open) {
        on_close();
      }
    };
    window.addEventListener('keydown', handle_keydown);
    return () => window.removeEventListener('keydown', handle_keydown);
  }, [is_open, on_close]);

  if (!is_open || !hospital) return null;

  const handle_copy_address = async () => {
    // 상세 주소가 없으므로 지도 검색에 쓸 수 있도록 기관명과 함께 복사
    await navigator.clipboard.writeText(`${hospital.기관명} ${hospital.주소}`);
    setIs_copied(true);
    setTimeout(() => setIs_copied(false), 2000);
  };

  const render_status_badge = (status: 서비스_운영_상태) => {
    if (status === '운영') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>운영 추정</span>
        </span>
      );
    } else if (status === '확인필요') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>확인 필요</span>
        </span>
      );
    } else if (status === '미운영') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>미운영 추정</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>정보 없음</span>
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
      {/* 배경 딤 */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={on_close} />

      {/* 모달 본체 (Clean Medical UI) */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#12141a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10">
        {/* 상단 헤더 */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {hospital.기관유형}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                공공의료기관
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {hospital.시도명} {hospital.시군구명} ({hospital.진료권명}권역)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {hospital.기관명}
            </h2>
          </div>

          <button
            onClick={on_close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5개 탭 네비게이션 */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141a] px-6 gap-2 shrink-0 overflow-x-auto">
          {[
            { id: 'info', label: '1. 기본정보' },
            { id: 'services', label: '2. 의료서비스' },
            { id: 'resources', label: '3. 의료자원' },
            { id: 'public_role', label: '4. 공공역할' },
            { id: 'location', label: '5. 위치 및 길찾기' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive_tab(tab.id as any)}
              className={`py-3 px-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                active_tab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ============================================================ */}
          {/* 1. 기본정보 탭 */}
          {/* ============================================================ */}
          {active_tab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    기관 연락처 및 운영시간
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-slate-500">대표전화:</span>
                      <a
                        href={`tel:${hospital.전화번호}`}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {hospital.전화번호}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-slate-500">진료시간:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{hospital.운영시간}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-slate-500">홈페이지:</span>
                      {hospital.홈페이지 ? (
                        <a
                          href={hospital.홈페이지}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-slate-700 dark:text-slate-300 hover:underline truncate"
                        >
                          {hospital.홈페이지}
                        </a>
                      ) : (
                        <span className="text-slate-400">미제공</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    소재지 정보
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {hospital.주소} <span className="text-[11px] font-normal text-slate-400">(상세 주소 미제공)</span>
                        </span>
                        <button
                          onClick={handle_copy_address}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {is_copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{is_copied ? '복사됨' : '기관명·지역 복사하기'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-400">
                      • 관할 중진료권: <strong>{hospital.진료권명}</strong> ({hospital.시도명} {hospital.시군구명})
                    </div>
                  </div>
                </div>
              </div>

              {/* 주요 진료 서비스 태그 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  주요 특화 공공의료 서비스
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.주요_의료서비스.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. 의료서비스 탭 (🟢/🟡/🔴/⚪ 색상+아이콘+텍스트) */}
          {/* ============================================================ */}
          {active_tab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>9대 핵심 의료서비스 운영 여부 (기관 유형·규모 기반 추정 · 방문 전 기관 확인 필요)</span>
                <span className="text-[11px]">기준: {hospital.데이터_신뢰성.기준시점}</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                {hospital.서비스_상세.map((svc) => (
                  <div
                    key={svc.코드}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {svc.서비스명}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {svc.비고}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {render_status_badge(svc.상태)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. 의료자원 탭 (총량/사용량/가용량 시각화) */}
          {/* ============================================================ */}
          {active_tab === 'resources' && (
            <div className="space-y-5">
              {/* 4대 주요 병상 자원 프로그레스 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1) 일반 입원병상 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-blue-600" /> 일반 입원병상
                    </span>
                    <span className="font-semibold text-slate-400">가동률: 실시간 미연동</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>총 {hospital.의료자원.병상.총병상}병상</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/60 text-[10.5px]">
                      사용·가용: 실시간 미연동
                    </span>
                  </div>
                </div>

                {/* 2) 응급실 병상 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-600" /> 응급실 ({hospital.의료자원.응급실.구분})
                    </span>
                    <span className="font-bold text-slate-400">상태: 실시간 미연동</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">응급실 잔여</span>
                      <strong className="text-sm text-slate-400 dark:text-slate-500 font-medium">미연동 (-)</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">소아 잔여</span>
                      <strong className="text-sm text-slate-400 dark:text-slate-500 font-medium">미연동 (-)</strong>
                    </div>
                  </div>
                </div>

                {/* 3) 중환자실 & 수술실 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    중환자실 &amp; 수술실 규모
                  </span>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span>중환자실(ICU):</span>
                    <span>약 {hospital.의료자원.중환자실.총병상}석 (가용: 실시간 미연동)</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>정규 수술실:</span>
                    <span>약 {hospital.의료자원.수술실.총실}실 (가동: 실시간 미연동)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">* 중환자실·수술실 규모는 총 병상 수 기반 추정치입니다.</p>
                </div>

                {/* 4) 의료인력 현황 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    의료인력 현황 (충원율 {hospital.의료자원.의료인력.충원율}%)
                  </span>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span>의사인력:</span>
                    <span>전문의 {hospital.의료자원.의료인력.전문의수}명 / 전체의사 {hospital.의료자원.의료인력.전체의사수}명</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>간호인력:</span>
                    <span>간호사 {hospital.의료자원.의료인력.간호사수}명</span>
                  </div>
                </div>
              </div>

              {/* 주요 의료장비 가동 상태 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  주요 특수 정밀 의료장비 가동 현황
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">CT</span>
                    <strong className={hospital.의료자원.주요장비.CT ? 'text-emerald-600' : 'text-slate-400'}>
                      {hospital.의료자원.주요장비.CT ? '가동 중' : '미보유'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">MRI</span>
                    <strong className={hospital.의료자원.주요장비.MRI ? 'text-emerald-600' : 'text-slate-400'}>
                      {hospital.의료자원.주요장비.MRI ? '가동 중' : '미보유'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">인공호흡기</span>
                    <strong className={hospital.의료자원.주요장비.인공호흡기 ? 'text-emerald-600' : 'text-slate-400'}>
                      {hospital.의료자원.주요장비.인공호흡기 ? '가동 중' : '미보유'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">인큐베이터</span>
                    <strong className={hospital.의료자원.주요장비.인큐베이터 ? 'text-emerald-600' : 'text-slate-400'}>
                      {hospital.의료자원.주요장비.인큐베이터 ? '보유' : '미보유'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">인공신장기</span>
                    <strong className={hospital.의료자원.주요장비.혈액투석기 > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                      {hospital.의료자원.주요장비.혈액투석기 > 0 ? `${hospital.의료자원.주요장비.혈액투석기}대` : '미보유'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. 공공역할 탭 */}
          {/* ============================================================ */}
          {active_tab === 'public_role' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">
                  보건복지부 법정 책임의료기관 지정 현황
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  본 기관은 「공공보건의료에 관한 법률」에 의거하여 <strong>{hospital.진료권명} 중진료권</strong>의 필수의료 협력체계를 총괄하는 지역 거점 의료기관입니다.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    취약계층 의료안전망 진료 지원사업
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    {hospital.공공역할.취약계층_지원사업.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    퇴원환자 지역사회 연계 및 돌봄 서비스
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    입원 환자 퇴원 시 의료원 공공의료협력팀 코디네이터가 보건소 방문간호, 건강보험공단 장기요양, 지자체 통합돌봄 자원과 원스톱으로 연계합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. 위치 및 길찾기 탭 */}
          {/* ============================================================ */}
          {active_tab === 'location' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    소재 지역
                  </span>
                  <button
                    onClick={handle_copy_address}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    {is_copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{is_copied ? '복사됨' : '기관명·지역 복사'}</span>
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {hospital.주소} <span className="text-xs font-normal text-slate-400">(상세 주소 미제공 · 아래 지도 검색 이용)</span>
                </p>
              </div>

              {/* 외부 길찾기 바로가기 */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(hospital.기관명)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs transition shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>카카오맵 길찾기</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>

                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(hospital.기관명)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>네이버지도 길찾기</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 데이터 신뢰성 UI 박스 (공통 푸터 전) */}
          {/* ============================================================ */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                데이터 출처 안내
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                상태: {hospital.데이터_신뢰성.상태}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-0.5 text-[11px]">
              <span>출처: {hospital.데이터_신뢰성.출처}</span>
              <span>수집: {hospital.데이터_신뢰성.최종수집}</span>
              <span>갱신: {hospital.데이터_신뢰성.갱신주기}</span>
            </div>
            <p className="pt-0.5 text-[10.5px]">
              기관명·총 병상·대표전화 등은 내장 데이터셋 값이며, 의료인력·장비·중환자실/수술실 규모 등은 기관 규모를 바탕으로 한 추정치입니다.
              정확한 정보는 해당 기관에 직접 확인하세요.
            </p>
          </div>
        </div>

        {/* 하단 고정 액션 바 */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${hospital.전화번호}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>전화 연결</span>
            </a>
            <button
              onClick={() => on_open_directions?.(hospital)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>지도 위치</span>
            </button>
          </div>

          <button
            onClick={on_close}
            className="px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
