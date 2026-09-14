/**
 * 보건복지부 지정 달빛어린이병원 및 야간/휴일 소아진료기관 조회 도구
 */

export interface MoonlightClinicInfo {
  기관명: string;
  지정구분: '달빛어린이병원' | '야간휴일진료기관' | '응급의료센터소아진료';
  시도명: string;
  시군구명: string;
  주소: string;
  전화번호: string;
  진료시간: {
    평일야간: string;
    토요일: string;
    일요일_공휴일: string;
  };
  인접_약국_운영: boolean;
}

const MOCK_PEDIATRIC_CLINICS: Record<string, MoonlightClinicInfo[]> = {
  영월군: [], // 달빛어린이병원 전무
  정선군: [], // 달빛어린이병원 전무
  평창군: [], // 달빛어린이병원 전무
  홍천군: [], // 달빛어린이병원 전무
  원주시: [
    {
      기관명: '원주세브란스기독병원 (소아전문응급의료센터)',
      지정구분: '응급의료센터소아진료',
      시도명: '강원특별자치도',
      시군구명: '원주시',
      주소: '강원특별자치도 원주시 일산로 20',
      전화번호: '033-741-0114',
      진료시간: {
        평일야간: '24시간 상시',
        토요일: '24시간 상시',
        일요일_공휴일: '24시간 상시',
      },
      인접_약국_운영: true,
    },
  ],
  춘천시: [
    {
      기관명: '강원대학교병원 (소아전문응급의료센터)',
      지정구분: '응급의료센터소아진료',
      시도명: '강원특별자치도',
      시군구명: '춘천시',
      주소: '강원특별자치도 춘천시 백령로 156',
      전화번호: '033-258-2000',
      진료시간: {
        평일야간: '24시간 상시',
        토요일: '24시간 상시',
        일요일_공휴일: '24시간 상시',
      },
      인접_약국_운영: true,
    },
  ],
};

export async function fetchPediatricNightClinics(params: { sgg: string; sido?: string }) {
  const cleanSgg = params.sgg.trim();
  const clinics = MOCK_PEDIATRIC_CLINICS[cleanSgg] || [];

  const hasClinic = clinics.length > 0;

  return {
    데이터_출처: '보건복지부 달빛어린이병원 및 심야소아진료기관 지정 현황',
    조회_지자체: cleanSgg,
    달빛어린이병원_수: clinics.filter((c) => c.지정구분 === '달빛어린이병원').length,
    심야소아진료기관_목록: clinics,
    접근성_상태: hasClinic ? '관내 야간진료 가능' : '관내 달빛어린이병원 및 심야 소아과 전무 (심야 진료 공백)',
    정책제언: !hasClinic
      ? `관내에 야간·휴일 소아 진료기관이 전무하므로, 보건소 소아 야간진료실 운영 또는 인접 거점병원(원주/춘천 등)과의 원격 소아 안심진료체계 구축이 시급함`
      : '야간 운영 지속을 위한 당직 의료인력 인건비 국비 보조 필요',
  };
}
