@echo off
chcp 65001 > nul
echo ========================================================
echo   [국립중앙의료원 헬스맵] 노트북 로컬 sLLM 서버 시작
echo   - 모델: Qwen/Qwen2.5-0.5B-Instruct (On-Device 초경량)
echo   - 포트: 8000
echo ========================================================
echo.

rem 이 배치 파일이 있는 폴더(프로젝트 루트) 기준으로 실행
cd /d "%~dp0"
python scripts/local_sllm_server.py

pause
