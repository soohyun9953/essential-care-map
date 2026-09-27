@echo off
chcp 65001 > nul
title [Essential Care Map] Local sLLM Server (Qwen 2.5 3B)

echo =====================================================================
echo  [Essential Care Map] 공공보건의료 로컬 sLLM 온디바이스 추론 서버
echo  - 기본 모델: Qwen 2.5 3B (고성능 실전 추천)
echo  - 서빙 포트: http://127.0.0.1:8000
echo  - 메모리 최적화: PyTorch bfloat16 (RAM 점유 ~5.5GB)
echo =====================================================================
echo.

python "%~dp0local_sllm_server.py" --model Qwen/Qwen2.5-3B-Instruct --port 8000
if %errorlevel% neq 0 (
    echo.
    echo [오류] 파이썬 서버 실행 중 문제가 발생했습니다.
    pause
)
