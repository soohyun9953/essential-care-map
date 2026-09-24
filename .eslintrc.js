/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // 이 프로젝트는 컴포넌트명을 한글로 작성하므로(예: 파일_업로더_모달),
    // 대문자 시작 함수만 컴포넌트로 인식하는 rules-of-hooks가 모든 훅 호출을 오탐함 → 비활성화
    'react-hooks/rules-of-hooks': 'off',
  },
};
