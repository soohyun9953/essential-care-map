# 🏥 국립중앙의료원 & 심평원 연계 필수의료 공공데이터 MCP 서버
> **Essential Care Public Data MCP Server**

대한민국 250개 시·군·구 및 70개 중진료권의 **응급의료 실시간 병상 정보, 심평원 전문의/자원 현황, 달빛어린이병원 소아진료 현황, 법정 취약지 판정 및 개조식 사업계획서 자동 생성**을 지원하는 Model Context Protocol(MCP) 서버입니다.

---

## 🛠️ 제공 도구 (Tools)

1. **`get_realtime_emergency_status`**
   - 국립중앙의료원 중앙응급의료센터 API 연계: 지자체별 실시간 응급실 가용병상, 음압격리, 중환자실(ICU), 소아병상 및 CT/MRI 가동 현황 조회
2. **`get_hira_hospital_resources`**
   - 건강보험심사평가원(HIRA) 연계: 산부인과, 소아청소년과, 응급의학과 전문의 수 및 분만실/소아전용 병상 인프라 통계
3. **`get_pediatric_night_clinics`**
   - 보건복지부 지정 달빛어린이병원 및 심야/휴일 소아진료기관 현황 및 소아의료 공백 진단
4. **`diagnose_essential_care_region`**
   - 보건복지부 의료취약지 고시 기준(응급/분만/소아 3대 영역) 종합 평가 및 4단계 취약도(심각/취약/관찰/정상) 등급 판정
5. **`generate_project_narrative`**
   - 정부 및 국립중앙의료원 공모사업 표준 서식에 맞춘 개조식 사업계획서 문안 자동 생성

---

## ⚙️ MCP 연동 설정 방법

### 0. 사전 빌드 (최초 1회 및 소스 수정 시)
`dist/`는 빌드 산출물이라 저장소에 포함되지 않습니다. 연동 전에 먼저 빌드하세요.

```bash
cd mcp-server
npm install
npm run build
```

### 1. Claude Desktop 설정 (`claude_desktop_config.json`)
파일 위치: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "essential-care-public-data": {
      "command": "node",
      "args": [
        "c:\\Users\\KITC\\Desktop\\헬스맵2\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "DATA_GO_KR_API_KEY": "공공데이터포털_인증키(선택사항)"
      }
    }
  }
}
```

### 2. Antigravity / Cursor / 기타 MCP 클라이언트 설정
```json
{
  "mcpServers": {
    "essential-care-public-data": {
      "command": "node",
      "args": [
        "c:/Users/KITC/Desktop/헬스맵2/mcp-server/dist/index.js"
      ]
    }
  }
}
```

---

## 💡 API 키 없이도 즉시 작동 (스마트 폴백 모드)
`DATA_GO_KR_API_KEY`를 넣지 않아도 국립중앙의료원 공공보건의료지원센터 표준 실측 데이터셋이 내장되어 있어 LLM 테스트 및 진단 질의가 즉시 완벽하게 작동합니다. 실제 운영 시 키를 등록하면 실시간 공공데이터포털 라이브 API로 자동 연계됩니다.
