// AI 공공병원 진단·개선 데이터 타입 정의
// ISP/ISMP 수준의 5대 AI 프로세스 (Diagnosis -> Root Cause -> Benchmarking/Prediction -> Recommendation -> Simulation -> Execution -> KPI)

export interface 공공병원_진단_지표점수 {
  공공성: number;         // 예: 82
  운영효율: number;       // 예: 71
  의료수요대응: number;   // 예: 76
  인력적정성: number;     // 예: 64
  필수의료대응: number;   // 예: 58
  재무건전성: number;     // 예: 68
  종합점수: number;       // 예: 69
  종합등급: 'A' | 'B' | 'C' | 'D';
}

export interface 지표_산출_근거 {
  지표명: string;
  점수: number;
  산출기준: string;
  사용데이터: string;
  기준연도: string;
  비교대상: string;
}

export interface AI_발견_이슈 {
  id: string;
  제목: string;
  심각도: '위험' | '경고' | '주의';
  핵심요약: string[];
  원인분석: {
    직접원인: string[];
    구조적원인: string[];
    연관데이터: { 라벨: string; 값: string; 단위: string; 상태: '위험' | '주의' | '양호' }[];
  };
}

export interface 벤치마킹_지표 {
  지표명: string;
  우리병원: number;
  유사병원: number;
  전국평균: number;
  상위병원: number;
  단위: string;
  격차설명: string;
}

export interface 연도별_수요예측 {
  연도: string;
  외래환자: number;
  입원환자: number;
  응급환자: number;
  병상수요: number;
  전문의수요: number;
  간호인력수요: number;
  위험구간여부?: boolean;
  위험메시지?: string;
}

export interface AI_개선_대안 {
  id: 'A' | 'B' | 'C' | 'CUSTOM';
  안명칭: string;
  제목: string;
  세부내용: string[];
  예상효과: '매우 높음' | '높음' | '중' | '낮음';
  비용수준: '높음' | '중' | '낮음';
  소요예산_억원: number;
  실행기간: string;
  실행가능성: '매우 높음' | '높음' | '중';
  추천이유: string;
  시뮬레이션결과: {
    응급환자처리량_현재: number;
    응급환자처리량_개선: number;
    평균대기시간_현재_분: number;
    평균대기시간_개선_분: number;
    전원율_현재_pct: number;
    전원율_개선_pct: number;
    인건비지수_현재: number;
    인건비지수_개선: number;
    공공성점수_현재: number;
    공공성점수_개선: number;
  };
}

export interface 실행계획_과제 {
  과제명: string;
  추진목적: string;
  추진내용: string[];
  추진기간: string;
  주관부서: string;
  소요예산: {
    인건비_억원: number;
    시스템_억원: number;
    시설장비_억원: number;
    국비매칭_pct: number;
    지방비매칭_pct: number;
  };
  목표KPI: {
    항목: string;
    현재값: string;
    목표값: string;
    달성기한: string;
  }[];
}

export interface 성과관리_KPI_실적 {
  kpi명: string;
  목표: number;
  현재실적: number;
  달성률_pct: number;
  단위: string;
  상태: '달성' | '근접' | '미달';
  AI진단평가: string;
  AI추가개선안: string;
}

export interface 병원_지역_Context {
  소재지: string;
  배후인구: number;
  고령화율_pct: number;
  응급의료취약여부: boolean;
  분만취약지등급: string;
  관내외래환자유출률_pct: number;
  관내입원환자유출률_pct: number;
  인근경쟁협력기관수: number;
  주요유출지역: string[];
}

export interface 공공병원_종합_AI_프로필 {
  id: string;
  기관명: string;
  시도명: string;
  시군구명: string;
  유형: '지방의료원' | '적십자병원';
  설립연도: number;
  허가병상: number;
  전문의수: number;
  간호사수: number;
  진단지표: 공공병원_진단_지표점수;
  산출근거목록: 지표_산출_근거[];
  주요이슈목록: AI_발견_이슈[];
  벤치마킹데이터: 벤치마킹_지표[];
  수요예측데이터: 연도별_수요예측[];
  개선대안목록: AI_개선_대안[];
  실행계획: 실행계획_과제;
  성과관리목록: 성과관리_KPI_실적[];
  지역컨텍스트: 병원_지역_Context;
}
