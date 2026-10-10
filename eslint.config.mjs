// ESLint 설정 (ESLint 9 flat config)
// - Next 16부터 `next lint`가 없으므로 ESLint CLI(`npm run lint` → `eslint .`)로 실행한다
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts', 'scripts/**', 'mcp-server/**', 'data/**', 'docs/**', '*.config.*'],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // 이 프로젝트는 컴포넌트명을 한글로 작성하므로(예: 파일_업로더_모달),
      // 대문자 시작 함수만 컴포넌트로 인식하는 rules-of-hooks가 모든 훅 호출을 오탐함 → 비활성화
      'react-hooks/rules-of-hooks': 'off',
      // eslint-plugin-react-hooks 7(Next 16)에서 새로 켜진 React Compiler 대비 규칙.
      // 브라우저 저장소 읽기·초기 진단 등 기존 effect 3곳이 해당 — 동작에는 문제 없어 기존 검사 수준 유지
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
