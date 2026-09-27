# -*- coding: utf-8 -*-
"""
노트북 로컬 sLLM 서빙 서버 (Qwen2.5 0.5B / 1.5B / 3B 동적 전환 서빙)
별도의 무거운 패키지 없이 Python 내장 http.server와 transformers, torch만으로 동작합니다.
- 포트: 8000
- 엔드포인트:
  - GET  /health   : 서버 상태 및 현재 로드된 모델, 가용 모델 목록 확인
  - POST /switch   : 모델 동적 전환 (0.5B <-> 1.5B <-> 3B)
  - POST /generate : 프롬프트 기반 텍스트 생성 (지정된 모델 자동 로드 지원)
"""

import sys
import os
import json
import time
import argparse
import gc
from http.server import HTTPServer, BaseHTTPRequestHandler

# 윈도우 콘솔 cp949 인코딩 에러 방지
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

DEFAULT_MODEL = "Qwen/Qwen2.5-3B-Instruct"
AVAILABLE_MODELS = [
    {"id": "Qwen/Qwen2.5-0.5B-Instruct", "name": "Qwen 2.5 0.5B (초경량 초고속)", "size": "0.5B"},
    {"id": "Qwen/Qwen2.5-1.5B-Instruct", "name": "Qwen 2.5 1.5B (속도·품질 균형)", "size": "1.5B"},
    {"id": "Qwen/Qwen2.5-3B-Instruct", "name": "Qwen 2.5 3B (고성능 심층분석 추천 ⭐)", "size": "3B"},
]

current_model_name = DEFAULT_MODEL
tokenizer = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_model(model_name: str = None):
    global tokenizer, model, device, current_model_name
    target = model_name or current_model_name
    print(f"[sLLM] Loading tokenizer and model: {target} on {device}...")
    start_t = time.time()
    try:
        tokenizer = AutoTokenizer.from_pretrained(target)
        dtype = torch.bfloat16 if hasattr(torch, 'bfloat16') else torch.float32
        model = AutoModelForCausalLM.from_pretrained(
            target,
            torch_dtype=dtype,
            low_cpu_mem_usage=True
        )
        current_model_name = target
        load_time = time.time() - start_t
        print(f"[sLLM] Model '{target}' loaded successfully in {load_time:.2f}s! Ready to serve.")
        return True
    except Exception as e:
        print(f"[sLLM ERROR] Failed to load '{target}': {e}", file=sys.stderr)
        return False

def switch_model(target_model_name: str) -> bool:
    global tokenizer, model, current_model_name
    if current_model_name == target_model_name and model is not None:
        return True

    print(f"[sLLM] Switching model from '{current_model_name}' to '{target_model_name}'...")
    # 기존 모델 메모리 해제
    model = None
    tokenizer = None
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    success = load_model(target_model_name)
    return success

def generate_response(prompt: str, model_name: str = None, max_new_tokens: int = 350, temperature: float = 0.7) -> dict:
    global tokenizer, model, device, current_model_name

    # 요청된 모델이 현재 로드된 모델과 다르면 전환 시도
    if model_name and model_name != current_model_name:
        switch_success = switch_model(model_name)
        if not switch_success:
            # 실패 시 기존 모델 유지하여 생성 시도
            print(f"[sLLM Warning] Reverting to current model: {current_model_name}")

    if model is None or tokenizer is None:
        load_success = load_model(current_model_name)
        if not load_success:
            return {"error": "Model could not be loaded", "status": "error"}

    start_t = time.time()
    
    messages = [
        {"role": "system", "content": "당신은 대한민국 보건복지부 및 공공의료 정책을 보좌하는 전문 sLLM 비서입니다. 제공된 지침과 법령을 근거로 격조 있고 명확한 한국어 개조식 보고서를 작성하세요."},
        {"role": "user", "content": prompt}
    ]
    
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    model_inputs = tokenizer([text], return_tensors="pt").to(device)
    
    with torch.no_grad():
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.1
        )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    elapsed_ms = int((time.time() - start_t) * 1000)
    
    return {
        "status": "success",
        "model": current_model_name,
        "device": device,
        "response": response_text.strip(),
        "elapsed_ms": elapsed_ms,
        "tokens_generated": len(generated_ids[0])
    }

class sLLMRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            payload = {
                "status": "healthy",
                "model": current_model_name,
                "device": device,
                "is_loaded": model is not None,
                "available_models": AVAILABLE_MODELS
            }
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/switch":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                target_model = data.get("model", DEFAULT_MODEL)
                success = switch_model(target_model)
                
                self.send_response(200 if success else 500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                res = {
                    "status": "success" if success else "error",
                    "current_model": current_model_name,
                    "is_loaded": model is not None
                }
                self.wfile.write(json.dumps(res, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))

        elif self.path == "/generate":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                prompt = data.get("prompt", "")
                req_model = data.get("model", None)
                max_tokens = int(data.get("max_new_tokens", 350))
                temperature = float(data.get("temperature", 0.7))
                
                result = generate_response(prompt, model_name=req_model, max_new_tokens=max_tokens, temperature=temperature)
                
                self.send_response(200)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                err_payload = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(err_payload, ensure_ascii=False).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def main():
    parser = argparse.ArgumentParser(description="Run local sLLM server with multi-model support")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000)")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help="Model name to load initially")
    parser.add_argument("--lazy", action="store_true", help="Do not load model immediately, load on first request")
    parser.add_argument("--test", action="store_true", help="Run a quick test inference and exit")
    args = parser.parse_args()

    global current_model_name
    current_model_name = args.model

    if not args.lazy:
        load_model(current_model_name)

    if args.test:
        test_prompt = "영월의료원의 필수의료 취약지 지원 방안을 개조식으로 요약해줘."
        print(f"\n[Test Prompt]: {test_prompt}")
        res = generate_response(test_prompt)
        print(f"[Generated ({res.get('elapsed_ms', 0)}ms)]:\n{res.get('response', '')}\n")
        print("[sLLM] Test completed successfully!")
        return

    server_address = ("127.0.0.1", args.port)
    httpd = HTTPServer(server_address, sLLMRequestHandler)
    print(f"\n[sLLM Server] Running at http://127.0.0.1:{args.port}")
    print(f"   - Active Model: {current_model_name}")
    print("   - Health check: GET  http://127.0.0.1:8000/health")
    print("   - Switch model: POST http://127.0.0.1:8000/switch")
    print("   - Inference:    POST http://127.0.0.1:8000/generate")
    print("   - Press Ctrl+C to stop.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[sLLM Server] Shutting down.")

if __name__ == "__main__":
    main()
