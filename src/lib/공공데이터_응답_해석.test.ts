import { describe, expect, it } from 'vitest';
import { 서비스키_정규화, 실패_사유 } from './공공데이터_응답_해석';

describe('공공데이터포털 응답 해석', () => {
  it('인코딩 키를 넣어도 디코딩 키로 맞춰 이중 인코딩을 막는다', () => {
    expect(서비스키_정규화('abc%2Bdef%3D%3D')).toBe('abc+def==');
    expect(서비스키_정규화(' "abc+def==" ')).toBe('abc+def==');
    expect(서비스키_정규화('abc+def==')).toBe('abc+def==');
  });

  it('실패 사유: 인증 오류·포털 오류 코드·HTTP 상태·결과 0건을 구분한다', () => {
    expect(실패_사유(403, '<OpenAPI_ServiceResponse><cmmMsgHeader><errMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</errMsg><returnAuthMsg>등록되지 않은 서비스키</returnAuthMsg></cmmMsgHeader></OpenAPI_ServiceResponse>')).toBe('포털 오류 SERVICE_KEY_IS_NOT_REGISTERED_ERROR · 등록되지 않은 서비스키');
    // Accept에 application/json이 앞서면 같은 오류가 JSON으로 온다 (실제 403 응답 형식)
    expect(실패_사유(403, '{\n  "OpenAPI_ServiceResponse": {\n    "cmmMsgHeader": {\n      "errMsg": "SERVICE_KEY_IS_NOT_REGISTERED_ERROR",\n      "returnAuthMsg": "등록되지 않은 서비스키",\n      "returnReasonCode": "30"\n    }\n  }\n}')).toBe('포털 오류 SERVICE_KEY_IS_NOT_REGISTERED_ERROR · 등록되지 않은 서비스키');
    expect(실패_사유(200, '<response><header><resultCode>22</resultCode><resultMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</resultMsg></header></response>')).toBe('포털 오류 22 LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR');
    expect(실패_사유(403, 'Forbidden')).toBe('HTTP 403');
    expect(실패_사유(200, '<response><header><resultCode>00</resultCode></header><body><items/><totalCount>0</totalCount></body></response>')).toBe('해당 지역 실시간 결과 없음');
  });
});
