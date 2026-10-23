import { describe, it, expect } from 'vitest';
import { 페르소나_목록, 오분류_교정_내역, 서브탭_찾기 } from './페르소나_메뉴_구조';
import { 신규_메뉴_구조_데이터 } from '@/components/대상자별_좌측_사이드바';

const AS_IS_ids = new Set(신규_메뉴_구조_데이터.flatMap((g) => g.menus.map((m) => m.id)));

describe('3대 사용자 그룹 메뉴 구조', () => {
  it('대국민 3 · 의료기관 5 · NMC 4, 서브탭 id는 그룹 번호로 시작하고 중복이 없다', () => {
    expect(페르소나_목록.map((p) => p.서브탭.length)).toEqual([3, 5, 4]);
    const ids = 페르소나_목록.flatMap((p, i) => p.서브탭.map((s) => {
      expect(s.id.startsWith(`${i + 1}-`)).toBe(true);
      return s.id;
    }));
    expect(new Set(ids).size).toBe(12);
  });

  it('AS-IS 메뉴 id는 모두 실제 사이드바에 있고, 모든 AS-IS 메뉴가 TO-BE 어딘가에 대응된다', () => {
    const 참조 = new Set(페르소나_목록.flatMap((p) => p.서브탭.flatMap((s) => s.as_is_메뉴_ids)));
    참조.forEach((id) => expect(AS_IS_ids.has(id), id).toBe(true));
    AS_IS_ids.forEach((id) => expect(참조.has(id), `미대응 AS-IS 메뉴 ${id}`).toBe(true));
  });

  it('준비 중 서브탭만 전용 안내 화면을 쓰고, 구현된 서브탭은 실제 화면으로 연결된다', () => {
    for (const p of 페르소나_목록)
      for (const s of p.서브탭) {
        if (s.상태 === '준비 중') expect(s.대상).toEqual({ 종류: '전용화면', 화면: '준비중' });
        else expect(s.대상.종류 === '워크스페이스' || (s.대상.종류 === '전용화면' && s.대상.화면 !== '준비중')).toBe(true);
      }
  });

  it('오분류 교정 내역은 6건이며 TO-BE·AS-IS 대상이 모두 실재한다', () => {
    expect(오분류_교정_내역).toHaveLength(6);
    for (const c of 오분류_교정_내역) {
      for (const t of c.to_be.split('·')) expect(서브탭_찾기(t.trim()), t).not.toBeNull();
      for (const id of c.as_is_메뉴_ids) expect(AS_IS_ids.has(id), id).toBe(true);
    }
  });
});
