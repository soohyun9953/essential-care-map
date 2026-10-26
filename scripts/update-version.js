const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '..', 'src', 'lib', '버전_정보.ts');
const pkgPath = path.join(__dirname, '..', 'package.json');

// 1. 기존 버전_정보.ts에서 기존 semver와 changelog 읽기
let semver = '1.44.0';
let changelog = '2-1 의사결정 통합, 13대 화면 동기화, 홈 하단 배너 일치화 및 실시간 버전 반영';

if (fs.existsSync(versionFilePath)) {
  const existingContent = fs.readFileSync(versionFilePath, 'utf8');
  const semverMatch = existingContent.match(/semver:\s*['"]([^'"]+)['"]/);
  if (semverMatch && semverMatch[1]) {
    semver = semverMatch[1];
  }
  const changelogMatch = existingContent.match(/changelog:\s*\n?\s*['"]([^'"]+)['"]/);
  if (changelogMatch && changelogMatch[1]) {
    changelog = changelogMatch[1];
  }
}

// CLI 인자 (--semver=1.44.0) 또는 환경변수(SEMVER)가 있으면 우선 적용
const semverArg = process.argv.find((arg) => arg.startsWith('--semver='));
if (semverArg) {
  semver = semverArg.split('=')[1].trim();
} else if (process.env.SEMVER) {
  semver = process.env.SEMVER.trim();
}

// 배포일시 갱신은 Vercel·CI 빌드(VERCEL 또는 CI 환경변수)에서만 수행한다.
// 로컬 빌드에서는 파일을 바꾸지 않아 작업 트리에 불필요한 변경이 생기지 않음.
// 버전을 올린 뒤 직접 갱신하려면: node scripts/update-version.js --force
if (!process.env.VERCEL && !process.env.CI && !process.argv.includes('--force')) {
  console.log(`[Version Update] 로컬 빌드 — 배포일시 갱신 생략 (현재: v${semver}, Vercel 배포 시 자동 갱신, 수동: --force)`);
  process.exit(0);
}

// 한국 시간 기준 YYYY-MM-DD HH:mm 생성
const now = new Date();
const utc = now.getTime() + now.getTimezoneOffset() * 60000;
const kst = new Date(utc + 9 * 3600000);

const year = kst.getFullYear();
const month = String(kst.getMonth() + 1).padStart(2, '0');
const day = String(kst.getDate()).padStart(2, '0');
const hours = String(kst.getHours()).padStart(2, '0');
const minutes = String(kst.getMinutes()).padStart(2, '0');

const dateStr = `${year}-${month}-${day}`;
const timeStr = `${hours}:${minutes}`;
const fullLabel = `${year}.${month}.${day} ${timeStr}`;
const packageVersion = `${year}${month}${day}-${hours}${minutes}`;

// changelog 내의 일시가 있다면 최신 일시로 치환
if (changelog.includes('(') && changelog.endsWith(')')) {
  changelog = changelog.replace(/\([^)]+\)$/, `(${fullLabel})`);
} else {
  changelog = `${changelog} (${fullLabel})`;
}

// 2. package.json 업데이트
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = packageVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

// 3. src/lib/버전_정보.ts 업데이트
const versionContent = `// 플랫폼 공통 버전 및 배포 정보 관리
// 배포 시마다 배포일자와 배포시간을 갱신합니다.

export const PLATFORM_VERSION = {
  date: '${dateStr}',
  time: '${timeStr}',
  deployedAt: '${fullLabel}',
  semver: '${semver}',
  fullLabel: '${fullLabel} · v${semver}',
  packageVersion: '${packageVersion}',
  updatedAt: '${dateStr} ${timeStr}',
  changelog:
    '${changelog.replace(/'/g, "\\'")}',
};
`;

fs.writeFileSync(versionFilePath, versionContent, 'utf8');
console.log(`[Version Update] 배포시간 갱신 완료: ${fullLabel} · v${semver} (${packageVersion})`);
