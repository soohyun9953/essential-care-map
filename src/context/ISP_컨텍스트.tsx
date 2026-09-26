'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ISP_TASKS, IspTask } from '@/data/ispTasks';

export type IspViewMode = 'to_be' | 'as_is';

export type PersonaType = 'mohw_nmc' | 'local_gov' | 'hospital_ceo' | 'coordinator';

export interface PersonaInfo {
  id: PersonaType;
  label: string;
  icon: string;
  subtitle: string;
  focusWorkspace: 'regional_diagnosis' | 'policy_planning' | 'medical_institution' | 'national_safety';
  focusSubtab?: string;
  keyMetric: string;
  description: string;
}

export const PERSONA_LIST: PersonaInfo[] = [
  {
    id: 'mohw_nmc',
    label: '보건복지부 / NMC 정책관',
    icon: '🏛️',
    subtitle: '전국 거시 진단 & 공모 심사',
    focusWorkspace: 'regional_diagnosis',
    keyMetric: '전국 250개 시군구 취약도 전수 관제',
    description: '전국 250개 시군구 거시 취약도 맵 분석 및 12대 항목 사업계획서 자동 적격성 심사 우선',
  },
  {
    id: 'local_gov',
    label: '지자체 보건행정',
    icon: '🏢',
    subtitle: '관내 취약지 진단 & 사업계획 수립',
    focusWorkspace: 'policy_planning',
    focusSubtab: 'report',
    keyMetric: '영월군 등 관내 결핍 분석 & 사업계획서',
    description: '시·도 및 보건소 관내 필수의료 취약요인 진단 및 복지부 제출용 12대 목차 사업계획서 즉시 인쇄',
  },
  {
    id: 'hospital_ceo',
    label: '공공병원 경영진',
    icon: '🏥',
    subtitle: '71개 CP 운영 & 신포괄 정책가산',
    focusWorkspace: 'medical_institution',
    focusSubtab: 'policy_incentive',
    keyMetric: '신포괄 가산 1.0% (연 2.5억) & ROI',
    description: '표준진료지침(CP) 71개 전수 운영, 신포괄 정책가산 연 2.5억 추가 확보 및 재원일수 단축 ROI 시뮬레이션',
  },
  {
    id: 'coordinator',
    label: '책임의료 전담 코디네이터',
    icon: '🚑',
    subtitle: '응급·분만 실시간 전원 & 병상 수배',
    focusWorkspace: 'national_safety',
    keyMetric: '골든타임 15분 내 핫라인 전원 의뢰',
    description: '관내 분만·응급 취약 환자 발생 시 E-Gen·심평원 API 연계 인근 상급병원 실시간 가용병상 즉시 연계',
  },
];

interface IspContextType {
  ispViewMode: IspViewMode;
  setIspViewMode: (mode: IspViewMode) => void;
  toggleIspViewMode: () => void;

  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  currentPersonaInfo: PersonaInfo;

  selectedTaskId: string | null;
  selectedTask: IspTask | null;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
}

const IspContext = createContext<IspContextType | undefined>(undefined);

export const IspProvider: React.FC<{
  children: ReactNode;
  onPersonaChange?: (persona: PersonaInfo) => void;
}> = ({ children, onPersonaChange }) => {
  const [ispViewMode, setIspViewMode] = useState<IspViewMode>('to_be');
  const [persona, setPersonaState] = useState<PersonaType>('mohw_nmc');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const toggleIspViewMode = () => {
    setIspViewMode((prev) => (prev === 'to_be' ? 'as_is' : 'to_be'));
  };

  const setPersona = (newPersona: PersonaType) => {
    setPersonaState(newPersona);
    const info = PERSONA_LIST.find((p) => p.id === newPersona) || PERSONA_LIST[0];
    onPersonaChange?.(info);
  };

  const openTaskDrawer = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const closeTaskDrawer = () => {
    setSelectedTaskId(null);
  };

  const currentPersonaInfo =
    PERSONA_LIST.find((p) => p.id === persona) || PERSONA_LIST[0];

  const selectedTask = selectedTaskId ? ISP_TASKS[selectedTaskId] || null : null;

  return (
    <IspContext.Provider
      value={{
        ispViewMode,
        setIspViewMode,
        toggleIspViewMode,
        persona,
        setPersona,
        currentPersonaInfo,
        selectedTaskId,
        selectedTask,
        openTaskDrawer,
        closeTaskDrawer,
      }}
    >
      {children}
    </IspContext.Provider>
  );
};

export const useIsp = (): IspContextType => {
  const context = useContext(IspContext);
  if (!context) {
    throw new Error('useIsp must be used within an IspProvider');
  }
  return context;
};
