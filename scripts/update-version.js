const fs = require('fs');
const path = require('path');

// 기능 배포 시 이 버전 번호를 올립니다. (배포일시는 빌드 때 자동 갱신)
const SEMVER = '1.17.0';

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

// 1. package.json 업데이트
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = packageVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// 2. src/lib/버전_정보.ts 업데이트
const versionFilePath = path.join(__dirname, '..', 'src', 'lib', '버전_정보.ts');
const versionContent = `// 플랫폼 공통 버전 및 배포 정보 관리
// 배포 시마다 배포일자와 배포시간을 갱신합니다.

export const PLATFORM_VERSION = {
  date: '${dateStr}',
  time: '${timeStr}',
  deployedAt: '${fullLabel}',
  semver: '${SEMVER}',
  fullLabel: '${fullLabel} · v${SEMVER}',
  packageVersion: '${packageVersion}',
  updatedAt: '${dateStr} ${timeStr}',
  changelog:
    '공공의료 AI 의사결정 플랫폼 배포 및 배포시간(${fullLabel}) 갱신',
};
`;

fs.writeFileSync(versionFilePath, versionContent, 'utf8');
console.log(`[Version Update] 배포시간 갱신 완료: ${fullLabel} · v${SEMVER} (${packageVersion})`);
