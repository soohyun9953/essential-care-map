# -*- coding: utf-8 -*-
"""
노트북 로컬 sLLM 초경량 서빙 서버 (Qwen/Qwen2.5-0.5B-Instruct)
별도의 무거운 패키지 없이 Python 내장 http.server와 transformers, torch만으로 동작합니다.
- 포트: 8000
- 엔드포인트:
  - GET  /health   : 서버 및 모델 로드 상태 확인
  - POST /generate : 프롬프트 기반 텍스트 생성
"""

import sys
import json
import time
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
tokenizer = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_model():
    global tokenizer, model, device
    print(f"[sLLM] Loading tokenizer and model: {MODEL_NAME} on {device}...")
    start_t = time.time()
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=dtype,
        device_map=device
    )
    load_time = time.time() - start_t
    print(f"[sLLM] Model loaded successfully in {load_time:.2f}s! Ready to serve.")

def generate_response(prompt: str, max_new_tokens: int = 350, temperature: float = 0.7) -> dict:
    global tokenizer, model, device
    if model is None or tokenizer is None:
        return {"error": "Model not loaded", "status": "error"}

    start_t = time.time()
    
    messages = [
        {"role": "system", "content": "당신은 보건복지부 및 공공의료 정책을 보좌하는 전문 sLLM 비서입니다. 간결하고 전문적인 한국어로 개조식 보고서를 작성하세요."},
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
        "model": MODEL_NAME,
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
                "model": MODEL_NAME,
                "device": device,
                "is_loaded": model is not None
            }
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/generate":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode("utf-8"))
                prompt = data.get("prompt", "")
                max_tokens = int(data.get("max_new_tokens", 350))
                
                result = generate_response(prompt, max_new_tokens=max_tokens)
                
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
    parser = argparse.ArgumentParser(description="Run local sLLM server")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000)")
    parser.add_argument("--test", action="store_true", help="Run a quick test inference and exit")
    args = parser.parse_args()

    load_model()

    if args.test:
        test_prompt = "영월의료원의 필수의료 취약지 지원 방안을 개조식으로 요약해줘."
        print(f"\n[Test Prompt]: {test_prompt}")
        res = generate_response(test_prompt)
        print(f"[Generated ({res['elapsed_ms']}ms)]:\n{res['response']}\n")
        print("[sLLM] Test completed successfully!")
        return

    server_address = ("127.0.0.1", args.port)
    httpd = HTTPServer(server_address, sLLMRequestHandler)
    print(f"\n🚀 [sLLM Server] Running at http://127.0.0.1:{args.port}")
    print("   - Health check: GET  http://127.0.0.1:8000/health")
    print("   - Inference:    POST http://127.0.0.1:8000/generate")
    print("   - Press Ctrl+C to stop.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[sLLM Server] Shutting down.")

if __name__ == "__main__":
    main()
