import { describe, it, expect } from 'vitest';
import { 필수의료_진단_엔진 } from './필수의료_엔진';
import { 사업계획서_AI_엔진, 공모_분야_목록 } from './사업계획서_AI_엔진';
import { build_proposal_section0_xml } from './hwpx_사업계획서_생성기';
import { get_patient_flow_data } from './환자_유출입_데이터셋';
import { 시군구_원천_데이터 } from './필수의료_타입';

const 지역 = (시군구명: string, overrides: Partial<시군구_원천_데이터> = {}) =>
  필수의료_진단_엔진.diagnose_region({
    시도코드: '51',
    시도명: '강원특별자치도',
    시군구코드: '51999',
    시군구명,
    인구수: 30000,
    응급_60분_미도달_인구비율: 50,
    관내_응급_의료이용률: 20,
    분만_60분_미도달_인구비율: 50,
    관내_분만율: 20,
    소아_병상_공급비율: 40,
    소아_야간휴일_접근성지수: 30,
    ...overrides,
  });

// 과거 유출입 자료가 없을 때 끼워 넣던 다른 지역 고정값 및 영월군 전용 표현
const 과거_고정값 = ['152,019', '25,615', '152,042', '25.1%', '74.9%', '37.1%', '+15%p', 'undefined', '제천', '원주', '68분', '폐광'];

const 통계 = 필수의료_진단_엔진.calculate_region_statistics([]);

describe('사업계획서: 유출입 자료가 없는 지역', () => {
  const 자료없는_지역 = 지역('존재하지않는군');

  it('테스트 전제: 해당 지역의 유출입 자료가 없다', () => {
    expect(get_patient_flow_data('존재하지않는군')).toBeUndefined();
  });

  it('텍스트 사업계획서에 다른 지역 수치를 넣지 않고 자료 없음을 명시한다', async () => {
    const 결과 = await 사업계획서_AI_엔진.generate_plan({
      target_region: 자료없는_지역,
      sido_stat: 통계,
      national_stat: 통계,
      domain_type: 'emergency',
    });
    for (const v of 과거_고정값) expect(결과.생성전문, v).not.toContain(v);
    expect(결과.생성전문).toContain('자료 없음');
  });

  it('HWPX 공문서에 다른 지역 수치를 넣지 않고 자료 없음을 명시한다', () => {
    const xml = build_proposal_section0_xml({
      region: 자료없는_지역,
      domain_info: 공모_분야_목록[0],
      patient_flow: null,
    });
    for (const v of 과거_고정값) expect(xml, v).not.toContain(v);
    expect(xml).toContain('자료 없음');
  });
});

describe('사업계획서: 유출입 자료가 있는 지역', () => {
  const 영월_유출입 = get_patient_flow_data('영월군')!;

  it('테스트 전제: 영월군 유출입 자료가 있다', () => {
    expect(영월_유출입).toBeDefined();
  });

  it('HWPX 공문서에 해당 지역의 실제 RI와 계산된 목표 증분을 쓴다', () => {
    const xml = build_proposal_section0_xml({
      region: 지역('영월군'),
      domain_info: 공모_분야_목록[0],
      patient_flow: 영월_유출입,
    });
    expect(xml).toContain(`현행 ${영월_유출입.ri}%`);
    if (영월_유출입.ri < 40) expect(xml).toContain(`(+${(40 - 영월_유출입.ri).toFixed(1)}%p)`);
    expect(xml).not.toContain('undefined');
  });
});
