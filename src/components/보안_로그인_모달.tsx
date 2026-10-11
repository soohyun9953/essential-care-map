'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  LogOut,
  Hospital,
} from 'lucide-react';

interface 보안_로그인_모달_속성 {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthSuccess: () => void;
  onLogout: () => void;
}

export const 보안_로그인_모달: React.FC<보안_로그인_모달_속성> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onAuthSuccess,
  onLogout,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage('');
      setIsSuccessAnim(false);
      // 모달이 열리면 입력창에 자동 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 비밀번호 검증은 서버(/api/auth/login)에서 수행하고, 성공 시 서버가 HttpOnly 인증 쿠키를 발급한다
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    if (!password) {
      setErrorMessage('패스워드를 입력해주세요.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setIsSuccessAnim(true);
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 600);
        return;
      }
      // 429인데 앱 문구가 없으면 Vercel 방화벽이 막은 경우
      setErrorMessage(
        data.message ||
          (res.status === 429
            ? '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
            : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
      );
    } catch {
      setErrorMessage('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
    setPassword('');
    inputRef.current?.focus();
  };

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      onLogout();
      onClose();
      window.location.replace('/login');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* 상단 헤더 배너 */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                {isAuthenticated ? (
                  <Unlock className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-blue-200 uppercase block">
                  국립중앙의료원 공공보건의료지원센터
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{isAuthenticated ? '시스템 접근 인가 확인' : '인가자 전용 보안 접속'}</span>
                </h3>
              </div>
            </div>

            {/* 닫기 버튼: 인증된 상태이거나 강제 잠금이 아닐 때 닫기 허용 */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 space-y-5">
          {isAuthenticated ? (
            // [상태 1]: 이미 인증된 경우 (로그아웃 / 인가 상태 확인)
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    현재 보안 인증이 완료되어 화면을 자유롭게 사용 중입니다.
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    국립중앙의료원 필수의료 취약지 진단 및 5대 워크스페이스(지역진단, 정책기획, 의료기관, AI분석, 국민안심)가 모두 정상 활성화되어 있습니다.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃 (화면 잠금)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-apple-sm"
                >
                  화면으로 돌아가기
                </button>
              </div>
            </div>
          ) : (
            // [상태 2]: 미인증 상태 (패스워드 입력 폼)
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="font-bold text-blue-950 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>공공보건의료 관계자 인가 안내</span>
                </div>
                본 시스템은 국가 필수의료 취약지 분석 및 지자체 공문서 사업계획서 작성을 위한 <strong>보안 플랫폼</strong>입니다.
                일반인의 무단 접근을 방지하기 위해 <strong>인가 패스워드</strong>를 입력하셔야 모든 기능을 이용하실 수 있습니다.
              </div>

              {/* 비밀번호 입력 필드 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  접속 패스워드
                </label>
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="패스워드를 입력하세요"
                    className={`w-full px-4 py-3.5 pr-12 text-sm rounded-2xl bg-slate-50 dark:bg-slate-900/80 border transition focus:outline-none focus:ring-2 ${
                      errorMessage
                        ? 'border-rose-400 focus:ring-rose-400/30 text-rose-900 dark:text-rose-200'
                        : isSuccessAnim
                        ? 'border-emerald-500 focus:ring-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/30 text-slate-900 dark:text-white'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title={showPassword ? '비밀번호 가리기' : '비밀번호 보기'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 오류 메시지 */}
                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium pt-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 성공 애니메이션 피드백 */}
                {isSuccessAnim && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold pt-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>인증 성공! 화면을 잠금 해제합니다...</span>
                  </div>
                )}
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSuccessAnim || isSubmitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs sm:text-sm font-bold shadow-apple-sm transition active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSuccessAnim ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>잠금 해제 중...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>패스워드 확인 및 입장</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* 모달 하단 보안 정책 문구 */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>보안 프로토콜 적용 · 비인가자의 무단 접속 시도가 제한됩니다.</span>
        </div>
      </div>
    </div>
  );
};
