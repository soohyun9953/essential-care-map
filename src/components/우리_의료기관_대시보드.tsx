"use client";

import React, { useState, useMemo } from "react";
import { 
  Building2, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  HelpCircle, ChevronRight, Stethoscope, Users, Bed, Award, 
  Search, ArrowUpRight, ArrowDownRight, MessageSquare, Sparkles,
  FileSpreadsheet, ShieldAlert, BarChart3, PieChart, Info,
  Compass, MapPin
} from "lucide-react";

// 프로젝트 내장 Card UI 유틸리티 컴포넌트
const Card = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`bg-white dark:bg-[#15161b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-base font-bold ${className}`}>{children}</h3>
);
const CardContent = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-4 pt-0 ${className}`}>{children}</div>
);

export interface MedicalCenterItem {
  id: string;
  name: string;
  region: string;
  type: string;
  beds: number;
  doctors: number;
  specialty: string[];
}

export interface MedicalCenterEvalItem {
  centerId: string;
  bedOccupancyRate: number;
  patientsPerDoctor: number;
  nurseGrade: number;
  grade: string;
  score: number;
  operatingProfitRatio: number;
  categoryScores: {
    quality: number;
    publicInterest: number;
    safety: number;
    governance: number;
  };
}

export const localMedicalCenters: MedicalCenterItem[] = [
  { id: 'MC01', name: '강원특별자치도 영월의료원', region: '강원 영월군', type: '지역책임의료기관', beds: 198, doctors: 24, specialty: ['중증응급', '인공신장실', '소아외래', '퇴원돌봄'] },
  { id: 'MC02', name: '경상남도 거창적십자병원', region: '경남 거창군', type: '지역책임의료기관', beds: 120, doctors: 14, specialty: ['응급의료', '혈액투석', '분만의료', '방문간호'] },
  { id: 'MC03', name: '전라남도 순천의료원', region: '전남 순천시', type: '지역거점공공병원', beds: 260, doctors: 32, specialty: ['심뇌혈관', '감염병전담', '응급중환자', '공공간병'] },
  { id: 'MC04', name: '충청남도 서산의료원', region: '충남 서산시', type: '지역책임의료기관', beds: 245, doctors: 28, specialty: ['응급의학', '심혈관조영', '소아청소년', '재택의료'] },
  { id: 'MC05', name: '전라북도 남원의료원', region: '전북 남원시', type: '지역거점공공병원', beds: 310, doctors: 35, specialty: ['지역응급', '분만취약지', '치매안심', '재활복지'] },
  { id: 'MC06', name: '경상북도 안동의료원', region: '경북 안동시', type: '지역책임의료기관', beds: 230, doctors: 26, specialty: ['음압격리', '호스피스', '외과수술', '방문진료'] },
  { id: 'MC07', name: '경기도 포천병원', region: '경기 포천시', type: '지역거점공공병원', beds: 180, doctors: 21, specialty: ['응급의료', '외국인근로자', '소아야간', '정신건강'] },
  { id: 'MC08', name: '충청북도 청주의료원', region: '충북 청주시', type: '지역책임의료기관', beds: 380, doctors: 45, specialty: ['응급심뇌혈관', '재활전문', '감염내과', '간호간병'] },
  { id: 'MC09', name: '제주특별자치도 서귀포의료원', region: '제주 서귀포시', type: '지역책임의료기관', beds: 250, doctors: 29, specialty: ['응급의료센터', '고압산소치료', '분만센터', '원격협진'] },
  { id: 'MC10', name: '부산광역시의료원', region: '부산 연제구', type: '지역거점공공병원', beds: 540, doctors: 68, specialty: ['공공중환자', '정신응급', '완화의료', '권역책임연계'] }
];

export const medicalCenterEvaluations: MedicalCenterEvalItem[] = [
  { centerId: 'MC01', bedOccupancyRate: 64.2, patientsPerDoctor: 22.4, nurseGrade: 3, grade: 'B', score: 76.4, operatingProfitRatio: -8.4, categoryScores: { quality: 21.5, publicInterest: 21.0, safety: 19.8, governance: 14.1 } },
  { centerId: 'MC02', bedOccupancyRate: 58.1, patientsPerDoctor: 26.1, nurseGrade: 4, grade: 'C', score: 68.2, operatingProfitRatio: -12.1, categoryScores: { quality: 18.2, publicInterest: 19.5, safety: 17.5, governance: 13.0 } },
  { centerId: 'MC03', bedOccupancyRate: 82.4, patientsPerDoctor: 19.2, nurseGrade: 2, grade: 'A', score: 88.6, operatingProfitRatio: +1.2, categoryScores: { quality: 26.8, publicInterest: 23.4, safety: 22.1, governance: 16.3 } },
  { centerId: 'MC04', bedOccupancyRate: 74.8, patientsPerDoctor: 20.8, nurseGrade: 2, grade: 'A', score: 84.5, operatingProfitRatio: -2.3, categoryScores: { quality: 25.1, publicInterest: 22.0, safety: 21.9, governance: 15.5 } },
  { centerId: 'MC05', bedOccupancyRate: 71.3, patientsPerDoctor: 21.5, nurseGrade: 3, grade: 'B', score: 79.1, operatingProfitRatio: -5.8, categoryScores: { quality: 22.4, publicInterest: 22.8, safety: 19.5, governance: 14.4 } },
  { centerId: 'MC06', bedOccupancyRate: 69.5, patientsPerDoctor: 23.0, nurseGrade: 3, grade: 'B', score: 78.0, operatingProfitRatio: -6.5, categoryScores: { quality: 22.0, publicInterest: 21.5, safety: 20.1, governance: 14.4 } },
  { centerId: 'MC07', bedOccupancyRate: 66.8, patientsPerDoctor: 24.2, nurseGrade: 3, grade: 'B', score: 75.3, operatingProfitRatio: -7.2, categoryScores: { quality: 20.8, publicInterest: 21.9, safety: 18.9, governance: 13.7 } },
  { centerId: 'MC08', bedOccupancyRate: 79.2, patientsPerDoctor: 18.9, nurseGrade: 2, grade: 'A', score: 86.4, operatingProfitRatio: -1.1, categoryScores: { quality: 26.0, publicInterest: 23.1, safety: 21.8, governance: 15.5 } },
  { centerId: 'MC09', bedOccupancyRate: 70.4, patientsPerDoctor: 22.1, nurseGrade: 3, grade: 'B', score: 77.8, operatingProfitRatio: -6.1, categoryScores: { quality: 22.5, publicInterest: 21.2, safety: 19.7, governance: 14.4 } },
  { centerId: 'MC10', bedOccupancyRate: 84.1, patientsPerDoctor: 17.5, nurseGrade: 1, grade: 'A', score: 91.2, operatingProfitRatio: +2.4, categoryScores: { quality: 27.8, publicInterest: 24.2, safety: 23.1, governance: 16.1 } }
];

interface MyHospitalDashboardProps {
  onNavigateToGis?: (regionCode?: string) => void;
  onNavigateToDualAi?: (prompt?: string) => void;
  onNavigateToPolicy?: (topic?: string) => void;
}

export const OurHospitalDashboard: React.FC<MyHospitalDashboardProps> = ({
  onNavigateToGis,
  onNavigateToDualAi,
  onNavigateToPolicy,
}) => {
  // 1. 의료기관 선택 상태
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    localMedicalCenters[0]?.id || "MC01"
  );
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "action" | "qa">("overview");

  // AI 질의 챗봇 상태
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    {
      role: "ai",
      content: "안녕하세요! 공공의료 데이터와 DW 지표를 기반으로 원인 분석, 경영 개선 및 공공성 강화 방안을 자문해 드립니다. 궁금한 점을 입력해주세요."
    }
  ]);

  // 선택된 병원 기본 정보
  const currentHospital = useMemo(() => {
    return localMedicalCenters.find((c) => c.id === selectedHospitalId) || localMedicalCenters[0];
  }, [selectedHospitalId]);

  // 선택된 병원 평가 및 상세 정보
  const currentEval = useMemo(() => {
    return (
      medicalCenterEvaluations.find((e) => e.centerId === selectedHospitalId) ||
      medicalCenterEvaluations[0]
    );
  }, [selectedHospitalId]);

  // AI 질의 핸들러
  const handleSendAiQuestion = (customQ?: string) => {
    const q = customQ || aiQuestion;
    if (!q.trim()) return;

    const newChat = [...chatHistory, { role: "user" as const, content: q }];
    setChatHistory(newChat);
    if (!customQ) setAiQuestion("");

    setTimeout(() => {
      let aiResp = "";
      if (q.includes("가동률") || q.includes("병상")) {
        aiResp = `[AI 분석] ${currentHospital.name}의 병상가동률은 ${currentEval.bedOccupancyRate}%로 전국 의료원 평균(74.2%) 대비 편차가 확인됩니다. 간호간병통합서비스 확대와 회복기 병상 전환을 통해 약 8.5%p 개선이 가능할 것으로 분석됩니다.`;
      } else if (q.includes("인력") || q.includes("의사") || q.includes("간호")) {
        aiResp = `[AI 인력진단] 전문의 1인당 일평균 환자수(${currentEval.patientsPerDoctor}명)와 간호등급(${currentEval.nurseGrade}등급) 감안 시, 야간 응급실 및 중환자실 인력 보강이 시급합니다. 국립대병원 파견 공공임상교수제(2명) 배정을 추천합니다.`;
      } else if (q.includes("적자") || q.includes("재정") || q.includes("수지")) {
        aiResp = `[AI 재정분석] 응급·분만 등 필수 공공진료 제공에 따른 착한 적자 비중이 연간 약 38%로 추산됩니다. '공공의료 성과기반 건강보험 시범수가' 및 지자체 매칭 지원 조례 제정을 연계 기획하시길 권장합니다.`;
      } else {
        aiResp = `[AI 종합 진단] ${currentHospital.name}(${currentHospital.region})의 핵심과제는 권역 책임의료기관과의 진료 연계 고도화 및 취약지 필수의료 핫라인 상시 가동입니다. 필요 시 상단 '정책 기획 탭'에서 맞춤형 사업계획서를 즉시 작성하실 수 있습니다.`;
      }
      setChatHistory([...newChat, { role: "ai", content: aiResp }]);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 타이틀 및 기관 셀렉터 */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                공공보건의료 협력체계 구축
              </span>
              <span className="text-xs text-slate-500">기관코드: {currentHospital.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              {currentHospital.name}
              <span className="text-sm font-normal text-slate-500">({currentHospital.region} 책임의료기관)</span>
            </h1>
          </div>
        </div>

        {/* 기관 전환 드롭다운 및 검색 */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[260px]">
            <select
              aria-label="의료기관 선택"
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {localMedicalCenters.map((h) => (
                <option key={h.id} value={h.id}>
                  [{h.region}] {h.name} ({h.type})
                </option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none rotate-90" />
          </div>

          <button
            onClick={() => onNavigateToGis && onNavigateToGis(currentHospital.region)}
            className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="해당 지역의 GIS 취약도 분석 지도로 이동"
          >
            <Activity className="w-3.5 h-3.5" />
            지역 GIS 진단
          </button>
        </div>
      </div>

      {/* 2. 병원 운영 핵심 현황 카드 (4대 지표) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 허가 병상 및 가동률 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">병상 규모 및 가동률</span>
            <Bed className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{currentHospital.beds}</span>
            <span className="text-xs text-slate-500">병상</span>
            <span className="text-sm font-semibold text-blue-600 ml-auto">{currentEval.bedOccupancyRate}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">전국 의료원 평균</span>
            <span className="font-medium text-slate-700">74.2%</span>
          </div>
        </div>

        {/* 의사수 및 1인당 환자수 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">전담 전문의 인력</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{currentHospital.doctors}</span>
            <span className="text-xs text-slate-500">명</span>
            <span className="text-xs text-slate-500 ml-auto">일평균 환자</span>
            <span className="text-sm font-semibold text-teal-700">{currentEval.patientsPerDoctor}명</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">간호관리료 등급</span>
            <span className="font-medium text-slate-700">{currentEval.nurseGrade}등급</span>
          </div>
        </div>

        {/* 종합 공공의료 평가등급 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">공공보건 종합평가</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{currentEval.grade}</span>
            <span className="text-xs text-slate-500">등급</span>
            <span className="text-sm font-semibold text-amber-700 ml-auto">{currentEval.score}점</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">양질의 의료 점수</span>
            <span className="font-medium text-slate-700">{currentEval.categoryScores.quality}점</span>
          </div>
        </div>

        {/* 연간 수지 및 공공적자 규모 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">재정 건전성 (수지)</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{currentEval.operatingProfitRatio}%</span>
            <span className="text-xs text-slate-500">(영업이익률)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">필수공공의료 손실보전</span>
            <span className="font-medium text-emerald-600">지원 심의중</span>
          </div>
        </div>
      </div>

      {/* 3. 4대 탭 메뉴 네비게이션 */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-blue-700 text-blue-800"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          기관 개요 및 지표 벤치마크
        </button>

        <button
          onClick={() => setActiveTab("analysis")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "analysis"
              ? "border-blue-700 text-blue-800"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI 심층 원인 진단 (Fact/Assumption)
        </button>

        <button
          onClick={() => setActiveTab("action")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "action"
              ? "border-blue-700 text-blue-800"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          단기/중장기 경영개선 과제
        </button>

        <button
          onClick={() => setActiveTab("qa")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "qa"
              ? "border-blue-700 text-blue-800"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-600" />
          AI 병원 경영 Q&A 어시스턴트
        </button>
      </div>

      {/* 4. 탭 콘텐츠 영역 */}
      {/* 탭 1: 기관 개요 및 지표 벤치마크 */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
                  <span>공공보건의료계획 4대 평가 영역 점수</span>
                  <span className="text-xs font-normal text-slate-500">전국 의료원 중앙값 대비</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "양질의 의료 (필수의료 질 관리)", val: currentEval.categoryScores.quality, max: 30, avg: 22.4 },
                  { label: "공익적 보건의료 (취약계층 및 안전망)", val: currentEval.categoryScores.publicInterest, max: 25, avg: 19.8 },
                  { label: "안전한 진료환경 (감염·환자안전)", val: currentEval.categoryScores.safety, max: 25, avg: 21.2 },
                  { label: "책임적 운영 (재정 및 거버넌스)", val: currentEval.categoryScores.governance, max: 20, avg: 14.6 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{item.label}</span>
                      <span>
                        <strong className="text-blue-700">{item.val}</strong> / {item.max}점
                        <span className="text-slate-400 ml-1.5">(평균 {item.avg})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${item.val >= item.avg ? "bg-blue-600" : "bg-amber-500"}`}
                        style={{ width: `${(item.val / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-800">
                  지역 내 필수의료 특화 진료 및 핵심 역할
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentHospital.specialty.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold rounded-full"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed border border-slate-200">
                  <strong>[지역 의료체계 역할]</strong> {currentHospital.name}은(는) {currentHospital.region} 중진료권의 핵심 지역책임의료기관으로서 응급의료, 감염병 상시 대응, 퇴원환자 지역사회 연계사업을 전담 수행하고 있습니다.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-800">
                  데이터 연계 액션
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => onNavigateToPolicy && onNavigateToPolicy(`${currentHospital.name} 지역책임의료기관 역량 강화 사업`)}
                  className="w-full p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-800 mb-1">
                    <span>맞춤형 사업계획서 자동 생성</span>
                    <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {currentHospital.name}의 부족 지표(병상가동률/의사인력)를 반영한 2026 공공병원 지원 신청서 작성
                  </p>
                </button>

                <button
                  onClick={() => onNavigateToDualAi && onNavigateToDualAi(`${currentHospital.name}의 공공보건의료 기능 개선안 비교 평가`)}
                  className="w-full p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-left transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-800 mb-1">
                    <span>듀얼 AI 정책 시뮬레이션</span>
                    <ArrowUpRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Gemini vs sLLM 모델을 통해 공공임상교수 유치 vs 필수의료 수가가산 효과 비교
                  </p>
                </button>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  정보 안내
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• 본 대시보드는 국립중앙의료원 공공보건의료 통계 및 DW 지표 데이터를 연동하여 제공합니다.</p>
                <p>• 지표 산출 주기: 연간 정기평가 및 분기별 모니터링 데이터 취합</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 탭 2: AI 심층 원인 진단 */}
      {activeTab === "analysis" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">AI 신뢰성 가이드: 사실(Fact)과 AI 추정(Estimate) 구분 원칙</p>
              <p className="text-amber-800 leading-relaxed">
                본 진단 결과는 DW 정량 데이터(사실)와 통계적 기계학습 모델이 도출한 병목 추정치(추정)를 명확히 분리하여 표시합니다. 정책 및 예산 심의 시 사실 데이터를 1차 근거로 활용하시기 바랍니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 정량적 사실 근거 (Fact) */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  검증된 사실 데이터 (DW Fact)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-900 mb-1">1. 병상 가동률 지표</p>
                  <p className="text-slate-700">
                    허가 {currentHospital.beds}병상 중 일평균 가동 병상은 약 {Math.round(currentHospital.beds * (currentEval.bedOccupancyRate / 100))}개({currentEval.bedOccupancyRate}%)로 
                    기준치(80%) 대비 저조.
                  </p>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-900 mb-1">2. 전문의 충원 및 간호 등급</p>
                  <p className="text-slate-700">
                    전문의 {currentHospital.doctors}인 재직 중, 필수진료과(응급·외과 등) 일부 결원 상태이며 간호등급은 {currentEval.nurseGrade}등급 유지.
                  </p>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-900 mb-1">3. 공공의료 지원 실적</p>
                  <p className="text-slate-700">
                    취약계층 진료 지원 건수 연간 상위 30% 이내 기록, 공익적 보건의료 점수 {currentEval.categoryScores.publicInterest}/25점.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI 분석 및 병목 추정 (Estimate) */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3 bg-amber-50/40 border-b border-amber-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  AI 모델 원인 추정 및 시뮬레이션 (Estimate)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100">
                  <p className="font-semibold text-amber-900 mb-1">가동률 저하의 주요 요인 (신뢰도 88%)</p>
                  <p className="text-slate-700">
                    입원의료 수요 부족이 아닌, 마취통증 및 수술실 전담 간호인력 부족으로 인한 수술 병상 락(Lock-out) 현상이 주요 병목으로 추정됨.
                  </p>
                </div>
                <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100">
                  <p className="font-semibold text-amber-900 mb-1">외래 및 전원 손실액 추정</p>
                  <p className="text-slate-700">
                    관내 중증 응급환자의 타 권역 상급종합병원 유출률 32%에 따른 연간 추정 손실 진료비 약 14.5억 원 발생.
                  </p>
                </div>
                <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100">
                  <p className="font-semibold text-amber-900 mb-1">추천 정책 개입 우선순위</p>
                  <p className="text-slate-700">
                    1순위: 응급실-수술실-중환자실 연계 패스트트랙 구축 / 2순위: 퇴원환자 재택복귀 케어매니저 전담팀 보강.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 탭 3: 단기/중장기 경영개선 과제 */}
      {activeTab === "action" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                단기 경영개선 실행과제 (1~6개월)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>1. 간호간병통합서비스 병상 확대 운영</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">즉시 추진</span>
                </div>
                <p className="text-slate-600">일반병동 1개 유닛(40병상) 전환을 통한 간호등급 개선 및 병상가동률 7.2%p 제고</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>2. 공공임상교수제 파견 인력 신청</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">공모 진행중</span>
                </div>
                <p className="text-slate-600">국립대병원 순환근무 체계를 활용하여 응급의학과·신경과 전문의 2인 우선 확보</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>3. 지역 보건소-의료원 핫라인 구축</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">협의체 구성</span>
                </div>
                <p className="text-slate-600">만성질환 고위험군 및 퇴원 고위험 환자 사후관리 연계율 45% ➔ 70% 목표</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                중·장기 발전 로드맵 (1~3년)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>1. 심뇌혈관 응급 중증의료센터 신축 및 증축</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">예타 준비</span>
                </div>
                <p className="text-slate-600">골든타임 내 시술을 위한 혈관조영실 확충 및 중환자 병상 15병상 추가 확보</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>2. 디지털 헬스케어 기반 원격 협진 인프라</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">국비 매칭</span>
                </div>
                <p className="text-slate-600">취약지 보건지소 및 119 구급대와의 실시간 생체신호 공유 원격의료 시범사업</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                  <span>3. 지속가능한 공공정책수가 제도 정착</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">제도화</span>
                </div>
                <p className="text-slate-600">응급·분만·소아 등 필수 적자 진료과목에 대한 사후보상 시범사업 참여</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 탭 4: AI 병원 경영 Q&A 어시스턴트 */}
      {activeTab === "qa" && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-200">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>{currentHospital.name} 전담 AI 의사결정 Q&A</span>
              </div>
              <span className="text-xs font-normal text-slate-500">의료원 DW 지표 기반 답변</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* 추천 질의 태그 */}
            <div>
              <span className="text-xs text-slate-500 block mb-2 font-medium">💡 추천 질의 클릭:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "현재 병상가동률 개선을 위한 가장 효과적인 단기 대책은?",
                  "의사 1인당 환자수와 간호등급을 고려한 인력 보강 방안은?",
                  "필수의료 제공에 따른 착한 적자 보전 및 지원사업 신청 팁은?",
                  "타 지역 유사 규모 지방의료원 대비 취약한 평가항목은?"
                ].map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendAiQuestion(tag)}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-lg text-slate-700 transition-colors text-left"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 채팅 히스토리 창 */}
            <div className="h-72 overflow-y-auto border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* 입력 폼 */}
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="질의 입력"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAiQuestion()}
                placeholder="궁금한 병원 운영 지표나 정책 과제에 대해 자유롭게 질문하세요..."
                className="flex-1 px-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <button
                onClick={() => handleSendAiQuestion()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                질문하기
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

