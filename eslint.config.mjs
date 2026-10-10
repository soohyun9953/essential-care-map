// ESLint 설정 (ESLint 9 flat config)
// - `next lint`는 Next 16에서 제거되므로 ESLint CLI(`npm run lint` → `eslint .`)로 실행한다
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts', 'scripts/**', 'mcp-server/**', 'data/**', 'docs/**', '*.config.*'],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // 이 프로젝트는 컴포넌트명을 한글로 작성하므로(예: 파일_업로더_모달),
      // 대문자 시작 함수만 컴포넌트로 인식하는 rules-of-hooks가 모든 훅 호출을 오탐함 → 비활성화
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];

export default eslintConfig;
