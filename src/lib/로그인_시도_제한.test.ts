import { beforeEach, describe, expect, it } from 'vitest';
import {
  기록_초기화,
  남은_시도_횟수,
  성공_기록,
  시도_상태_확인,
  실패_기록,
  실패_집계_구간_ms,
  접속_IP,
  차단_시간_ms,
  최대_실패_횟수,
} from './로그인_시도_제한';

describe('로그인 시도 제한', () => {
  beforeEach(() => 기록_초기화());

  it('한도 전까지는 차단하지 않고 남은 횟수를 줄인다', () => {
    const t = 1_000_000;
    for (let i = 1; i < 최대_실패_횟수; i++) {
      expect(실패_기록('1.1.1.1', t + i).차단됨).toBe(false);
      expect(남은_시도_횟수('1.1.1.1', t + i)).toBe(최대_실패_횟수 - i);
    }
    expect(시도_상태_확인('1.1.1.1', t + 10).차단됨).toBe(false);
  });

  it('한도에 도달하면 차단하고, 차단 시간이 지나면 풀린다', () => {
    const t = 1_000_000;
    for (let i = 0; i < 최대_실패_횟수 - 1; i++) 실패_기록('1.1.1.1', t);
    const 결과 = 실패_기록('1.1.1.1', t);
    expect(결과.차단됨).toBe(true);
    expect(결과.남은_초).toBe(차단_시간_ms / 1000);

    const 중간 = 시도_상태_확인('1.1.1.1', t + 60_000);
    expect(중간.차단됨).toBe(true);
    expect(중간.남은_초).toBe(차단_시간_ms / 1000 - 60);

    expect(시도_상태_확인('1.1.1.1', t + 차단_시간_ms + 1).차단됨).toBe(false);
    expect(남은_시도_횟수('1.1.1.1', t + 차단_시간_ms + 1)).toBe(최대_실패_횟수);
  });

  it('집계 구간이 지난 실패는 새로 센다', () => {
    const t = 1_000_000;
    for (let i = 0; i < 최대_실패_횟수 - 1; i++) 실패_기록('1.1.1.1', t);
    expect(실패_기록('1.1.1.1', t + 실패_집계_구간_ms + 1).차단됨).toBe(false);
    expect(남은_시도_횟수('1.1.1.1', t + 실패_집계_구간_ms + 1)).toBe(최대_실패_횟수 - 1);
  });

  it('IP별로 따로 세고, 성공하면 기록을 지운다', () => {
    const t = 1_000_000;
    for (let i = 0; i < 최대_실패_횟수; i++) 실패_기록('1.1.1.1', t);
    expect(시도_상태_확인('1.1.1.1', t).차단됨).toBe(true);
    expect(시도_상태_확인('2.2.2.2', t).차단됨).toBe(false);

    실패_기록('3.3.3.3', t);
    성공_기록('3.3.3.3');
    expect(남은_시도_횟수('3.3.3.3', t)).toBe(최대_실패_횟수);
  });

  it('접속 IP는 x-real-ip, 없으면 x-forwarded-for 첫 값을 쓴다', () => {
    expect(접속_IP(new Headers({ 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '8.8.8.8' }))).toBe('9.9.9.9');
    expect(접속_IP(new Headers({ 'x-forwarded-for': '8.8.8.8, 10.0.0.1' }))).toBe('8.8.8.8');
    expect(접속_IP(new Headers())).toBe('unknown');
  });
});
