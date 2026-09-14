#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
dotenv.config();

import { fetchRealtimeEmergencyStatus } from './tools/emergency.js';
import { fetchHiraHospitalResources } from './tools/hira.js';
import { fetchPediatricNightClinics } from './tools/pediatric.js';
import { diagnoseEssentialCareRegion } from './tools/diagnosis.js';
import { generateProjectNarrative } from './tools/narrative.js';

const server = new Server(
  {
    name: 'essential-care-public-data-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 1. 사용 가능한 MCP 도구 목록 정의
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_realtime_emergency_status',
        description:
          '국립중앙의료원 중앙응급의료센터 API 연계: 특정 지자체(시군구)의 실시간 응급실 가용병상, 음압병상, 중환자실, 소아병상 및 CT/MRI 장비 가동 현황을 조회합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            sgg: {
              type: 'string',
              description: '시군구명 (예: "영월군", "정선군", "홍천군", "해남군")',
            },
            sido: {
              type: 'string',
              description: '시도명 (선택, 예: "강원특별자치도", "전라남도")',
            },
          },
          required: ['sgg'],
        },
      },
      {
        name: 'get_hira_hospital_resources',
        description:
          '건강보험심사평가원(HIRA) 의료자원 통계 연계: 해당 지자체의 의사인력(산부인과/소아청소년과/응급의학과 전문의 수), 분만실 인가병상, 소아전용 병상 등 필수의료 인프라 통계를 조회합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            sgg: {
              type: 'string',
              description: '시군구명 (예: "영월군", "정선군", "평창군")',
            },
          },
          required: ['sgg'],
        },
      },
      {
        name: 'get_pediatric_night_clinics',
        description:
          '보건복지부 지정 달빛어린이병원 및 심야/휴일 소아진료기관 현황을 조회하여 야간 소아의료 공백 여부를 파악합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            sgg: {
              type: 'string',
              description: '시군구명 (예: "영월군", "원주시", "춘천시")',
            },
            sido: {
              type: 'string',
              description: '시도명 (선택)',
            },
          },
          required: ['sgg'],
        },
      },
      {
        name: 'diagnose_essential_care_region',
        description:
          '보건복지부 취약지 고시 기준 3대 필수의료(응급·분만·소아) 종합 취약도 진단 및 4단계 등급(심각/취약/관찰/정상)을 판정합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            sgg: {
              type: 'string',
              description: '진단할 시군구명 (예: "영월군", "정선군", "홍천군")',
            },
          },
          required: ['sgg'],
        },
      },
      {
        name: 'generate_project_narrative',
        description:
          '국립중앙의료원 및 보건복지부 공모신청 표준 서식에 맞춘 공문서 개조식 사업계획서 서술문을 실시간 통계 기반으로 자동 생성합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            sgg: {
              type: 'string',
              description: '사업계획서를 작성할 시군구명 (예: "영월군", "정선군")',
            },
          },
          required: ['sgg'],
        },
      },
    ],
  };
});

/**
 * 2. MCP 도구 실행 핸들러
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_realtime_emergency_status': {
        const result = await fetchRealtimeEmergencyStatus({
          sgg: String(args?.sgg || ''),
          sido: args?.sido ? String(args.sido) : undefined,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_hira_hospital_resources': {
        const result = await fetchHiraHospitalResources({
          sgg: String(args?.sgg || ''),
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_pediatric_night_clinics': {
        const result = await fetchPediatricNightClinics({
          sgg: String(args?.sgg || ''),
          sido: args?.sido ? String(args.sido) : undefined,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'diagnose_essential_care_region': {
        const result = await diagnoseEssentialCareRegion({
          sgg: String(args?.sgg || ''),
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'generate_project_narrative': {
        const result = await generateProjectNarrative({
          sgg: String(args?.sgg || ''),
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`알 수 없는 도구 호출: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `[MCP 오류 발생] ${error?.message || String(error)}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('공공보건의료 데이터 API 연동 MCP 서버가 Stdio 모드로 성공적으로 시작되었습니다.');
}

main().catch((err) => {
  console.error('MCP 서버 구동 실패:', err);
  process.exit(1);
});
