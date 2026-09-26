'use client';

import React from 'react';
import { useIsp } from '@/context/ISP_컨텍스트';
import { Sparkles } from 'lucide-react';

interface ISP_과제_뱃지_속성 {
  taskId: string; // "3.8", "3.4", "3.3", "3.10"
  customLabel?: string; // 예: "[과제 3.8 헬스맵 고도화]"
  className?: string;
  showIcon?: boolean;
}

export const ISP_과제_뱃지: React.FC<ISP_과제_뱃지_속성> = ({
  taskId,
  customLabel,
  className = '',
  showIcon = true,
}) => {
  const { openTaskDrawer } = useIsp();

  // 기본 라벨 매핑
  const defaultLabels: Record<string, string> = {
    '3.8': '과제 3.8 헬스맵 고도화',
    '3.4': '과제 3.4 기능보강 PMS',
    '3.3': '과제 3.3 CP 전주기 시스템',
    '3.10': '과제 3.10 모자·응급 실시간 전원',
  };

  const label = customLabel || defaultLabels[taskId] || `과제 ${taskId}`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openTaskDrawer(taskId);
      }}
      title={`ISP 개선과제 ${taskId} 상세 스펙 및 기대효과 보기`}
      className={`inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white cursor-pointer transition shadow-2xs group shrink-0 ${className}`}
    >
      {showIcon && (
        <Sparkles className="w-2.5 h-2.5 text-blue-500 group-hover:text-white transition" />
      )}
      <span>[{label}]</span>
    </button>
  );
};
