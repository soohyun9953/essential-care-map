'use client';

import React, { useMemo, useState } from 'react';
import { AI_질의_입력창 } from '@/components/ai/AI_질의_입력창';
import { BrainCircuit, GraduationCap, MonitorSmartphone, Stethoscope, UserSearch } from 'lucide-react';
import { 경량_RAG_엔진 } from '@/lib/경량_rag_엔진';

// ② 의료기관 담당자 › 2-5 직무역량 맞춤 교육(LMS)·인력매칭·스마트병원 (AP-07 & B영역 과제 3.15)
// 이 화면의 과정 목록·후보 인력·협진/구독 처리는 시연용이며 실제 LMS·채용·협진 시스템과 연결되어 있지 않다.
// AI 튜터는 플랫폼 지침 문서 검색(출처 표시)으로 동작한다.

const 직종별_역량: Record<string, { 역량: string; 목표: number }[]> = {
  간호사: [
    { 역량: '중환자 간호', 목표: 4 },
    { 역량: '감염관리', 목표: 4 },
    { 역량: '퇴원·지역사회 연계', 목표: 3 },
    { 역량: '고위험 산모·신생아 간호', 목표: 3 },
    { 역량: '디지털·EMR 활용', 목표: 3 },
  ],
  의사: [
    { 역량: '응급·중증 초기대응', 목표: 4 },
    { 역량: '표준진료지침(CP) 운영', 목표: 3 },
    { 역량: '원격협진·e-ICU', 목표: 3 },
    { 역량: '임상 AI 활용', 목표: 3 },
    { 역량: '공공보건의료 계획', 목표: 2 },
  ],
  행정: [
    { 역량: '회계·공시', 목표: 4 },
    { 역량: '공공보건의료 계획', 목표: 3 },
    { 역량: '기능보강 사업관리', 목표: 3 },
    { 역량: '개인정보보호', 목표: 4 },
    { 역량: '디지털·EMR 활용', 목표: 2 },
  ],
};

// 역량 → 추천 과정 (예시 과정명, 실제 개설 과정 아님)
const 추천_과정: Record<string, string> = {
  '중환자 간호': '중환자 간호 심화 (예시)',
  감염관리: '의료관련감염 관리 실무 (예시)',
  '퇴원·지역사회 연계': '퇴원환자 지역사회 연계 실무 (예시)',
  '고위험 산모·신생아 간호': '고위험 분만·신생아 응급 간호 (예시)',
  '디지털·EMR 활용': 'EMR·데이터 활용 기초 (예시)',
  '응급·중증 초기대응': '응급·중증 초기대응 시뮬레이션 (예시)',
  '표준진료지침(CP) 운영': 'CP 개발·변이관리 실무 (예시)',
  '원격협진·e-ICU': '원격 중환자 협진 운영 (예시)',
  '임상 AI 활용': '임상 AI 판독보조 활용과 한계 (예시)',
  '공공보건의료 계획': '공공보건의료계획 수립 실무 (예시)',
  '회계·공시': '지방의료원 결산·알리미 공시 실무 (예시)',
  '기능보강 사업관리': '기능보강 사업계획·정산 실무 (예시)',
  개인정보보호: '의료기관 개인정보보호 실무 (예시)',
};

const 시연_후보: { id: string; 진료과: string; 경력: number; 희망형태: string; 지역: string }[] = [
  { id: '후보 A', 진료과: '내과', 경력: 28, 희망형태: '주 3일', 지역: '강원' },
  { id: '후보 B', 진료과: '산부인과', 경력: 31, 희망형태: '전일제', 지역: '경기' },
  { id: '후보 C', 진료과: '소아청소년과', 경력: 25, 희망형태: '주 4일', 지역: '강원' },
  { id: '후보 D', 진료과: '외과', 경력: 30, 희망형태: '전일제', 지역: '충북' },
  { id: '후보 E', 진료과: '내과', 경력: 22, 희망형태: '전일제', 지역: '강원' },
];

const 임상_AI_분야 = ['흉부 X선 판독 보조', '뇌출혈 CT 검출 보조', '심전도 분석 보조', '폐결절 CT 검출 보조'];

const 시연_배지 = <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">시연</span>;

export function 교육_인력매칭_스마트병원_화면() {
  const [직종, set_직종] = useState<keyof typeof 직종별_역량>('간호사');
  const [자가평가, set_자가평가] = useState<Record<string, number>>({});
  const 역량 = 직종별_역량[직종];
  const 갭 = 역량
    .map((r) => ({ ...r, 현재: 자가평가[r.역량] ?? 2, 차이: r.목표 - (자가평가[r.역량] ?? 2) }))
    .sort((a, b) => b.차이 - a.차이);

  const [튜터_질문, set_튜터_질문] = useState('');
  const [튜터_답, set_튜터_답] = useState<ReturnType<typeof 경량_RAG_엔진.retrieve>>([]);

  const [필요_진료과, set_필요_진료과] = useState('내과');
  const 매칭 = useMemo(
    () => 시연_후보.filter((c) => c.진료과 === 필요_진료과).sort((a, b) => Number(b.지역 === '강원') - Number(a.지역 === '강원') || b.경력 - a.경력),
    [필요_진료과]
  );

  const [협진_상태, set_협진_상태] = useState('');
  const [구독, set_구독] = useState<string[]>([]);
  const [구독_상태, set_구독_상태] = useState('');

  const 카드 = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2';
  const 제목 = 'text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap';
  const 코드 = (c: string) => <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{c}</span>;

  return (
    <div className="max-w-[1500px] mx-auto w-full p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">직무역량 맞춤 교육·인력매칭·스마트병원</h2>
        {코드('AP-07')}
        {코드('B영역 과제 3.15')}
        <span className="text-[11px] text-slate-500">과정·후보·협진·구독은 시연용이며 실제 LMS·채용·협진 시스템과 연결되어 있지 않습니다.</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 items-start">
        {/* 좌측 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className={카드}>
            <h3 className={제목}><GraduationCap className="w-4 h-4 text-blue-600" /> 직무역량 Gap 진단 {코드('AIS-07-04')}</h3>
            <select value={직종} onChange={(e) => { set_직종(e.target.value as keyof typeof 직종별_역량); set_자가평가({}); }} className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="직종">
              {Object.keys(직종별_역량).map((k) => <option key={k}>{k}</option>)}
            </select>
            {역량.map((r) => (
              <label key={r.역량} className="flex items-center justify-between gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <span>{r.역량} <span className="text-slate-400">(목표 {r.목표})</span></span>
                <input type="range" min={1} max={5} value={자가평가[r.역량] ?? 2} onChange={(e) => set_자가평가((p) => ({ ...p, [r.역량]: Number(e.target.value) }))} aria-label={`${r.역량} 자가평가`} />
                <span className="w-4 text-right tabular-nums">{자가평가[r.역량] ?? 2}</span>
              </label>
            ))}
            <p className="text-[10px] text-slate-400">자가평가(1~5)와 직종별 목표 수준(플랫폼 예시)의 차이로 Gap을 계산합니다.</p>
          </section>

          <section className={카드}>
            <h3 className={제목}><GraduationCap className="w-4 h-4 text-emerald-600" /> 맞춤형 과정 추천 {코드('AIS-07-01')} {시연_배지}</h3>
            {갭.filter((g) => g.차이 > 0).length === 0 ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">모든 역량이 목표 수준 이상입니다.</p>
            ) : (
              <ol className="space-y-1">
                {갭.filter((g) => g.차이 > 0).map((g, i) => (
                  <li key={g.역량} className="text-xs text-slate-700 dark:text-slate-300">
                    {i + 1}. {추천_과정[g.역량] ?? `${g.역량} 과정 (예시)`} <span className="text-slate-400">— {g.역량} Gap {g.차이}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="text-[10px] text-slate-400">과정명은 예시입니다. 실제 과정은 LMS 연계 후 제공됩니다.</p>
          </section>

          <section className={카드}>
            <h3 className={제목}><BrainCircuit className="w-4 h-4 text-purple-600" /> AI 튜터 {코드('AIS-07-03')}</h3>
            <AI_질의_입력창
              value={튜터_질문}
              onChange={set_튜터_질문}
              onSubmit={(q) => set_튜터_답(경량_RAG_엔진.retrieve(q, 4).filter((x) => x.청크.검증상태 !== '원문 미확인').slice(0, 2))}
              예시="CP 운영 가산율은 얼마야?"
              실행_라벨="질문"
              크기="sm"
              버튼_색="bg-purple-600 hover:bg-purple-700"
              aria_label="튜터 질문"
            />
            {튜터_답.map((x) => (
              <div key={x.청크.id} className="text-[11px] text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                {x.청크.본문.slice(0, 220)}{x.청크.본문.length > 220 ? '…' : ''}
                <div className="text-slate-400 mt-1">출처: {x.청크.문서명} ({x.청크.검증상태 ?? '검증 상태 미표시'})</div>
              </div>
            ))}
            <p className="text-[10px] text-slate-400">플랫폼에 등록된 지침 문서에서 찾아 출처와 함께 보여줍니다 (생성형 답변 아님).</p>
          </section>

          <section className={카드}>
            <h3 className={제목}><UserSearch className="w-4 h-4 text-amber-600" /> 시니어의사 채용 매칭 &apos;닥터링크&apos; {코드('AIS-07-02')} {시연_배지}</h3>
            <select value={필요_진료과} onChange={(e) => set_필요_진료과(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="필요 진료과">
              {Array.from(new Set(시연_후보.map((c) => c.진료과))).map((d) => <option key={d}>{d}</option>)}
            </select>
            <ul className="space-y-1">
              {매칭.map((c) => (
                <li key={c.id} className="text-xs text-slate-700 dark:text-slate-300">· {c.id} — {c.진료과} 경력 {c.경력}년, {c.희망형태}, 희망지역 {c.지역}</li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-400">가상 후보입니다(실존 인물 아님). 같은 지역·경력 순으로 정렬합니다.</p>
          </section>
        </div>

        {/* 우측 */}
        <div className="space-y-4">
          <section className={카드}>
            <h3 className={제목}><MonitorSmartphone className="w-4 h-4 text-blue-600" /> 원격 중환자실(e-ICU) 비대면 협진 연결 {시연_배지}</h3>
            <p className="text-[11px] text-slate-500">분당서울대병원–경기도의료원 모델을 참고한 상급병원–지역 공공병원 원격 중환자 협진 화면입니다. 실제 영상·EMR 연결은 없습니다.</p>
            <select className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="협진 기관">
              <option>권역책임의료기관 중환자실 (협진 기관 선택)</option>
              <option>강원대학교병원</option>
              <option>연세대학교원주세브란스기독병원</option>
              <option>강릉아산병원</option>
            </select>
            <textarea rows={3} placeholder="환자 상태 요약 (예: 패혈성 쇼크 의심, 승압제 사용 중)" className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" aria-label="환자 상태 요약" />
            <button type="button" onClick={() => set_협진_상태('협진 요청이 대기열에 등록되었습니다 (시연 — 실제 전송 없음).')} className="w-full px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5">
              <Stethoscope className="w-4 h-4" /> 비대면 협진 요청
            </button>
            {협진_상태 && <p className="text-[11px] text-blue-700 dark:text-blue-300">{협진_상태}</p>}
          </section>

          <section className={카드}>
            <h3 className={제목}><BrainCircuit className="w-4 h-4 text-emerald-600" /> 임상 AI 공동활용 구독 신청 {코드('AI-S07')} {시연_배지}</h3>
            <p className="text-[11px] text-slate-500">식약처 허가(인증)를 받은 임상 AI를 공공병원이 함께 쓰는 공동구독 신청 화면입니다. 분야별 허가 제품·조건은 식약처 의료기기 허가 정보로 확인해야 합니다.</p>
            {임상_AI_분야.map((a) => (
              <label key={a} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={구독.includes(a)} onChange={(e) => set_구독((p) => (e.target.checked ? [...p, a] : p.filter((x) => x !== a)))} /> {a}
              </label>
            ))}
            <button type="button" disabled={구독.length === 0} onClick={() => set_구독_상태(`${구독.length}개 분야 공동활용 신청이 접수되었습니다 (시연 — 실제 신청 없음).`)} className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer">
              구독 신청
            </button>
            {구독_상태 && <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{구독_상태}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
