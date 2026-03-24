import os
import requests
import json
import base64
import time
import fitz  # PyMuPDF
from typing import Dict, Any
import logging
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry


class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "anthropic/claude-3.5-sonnet"

        if not self.api_key:
            raise EnvironmentError("OPENROUTER_API_KEY is missing from environment variables.")

        # Setup Retry Strategy
        self.session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retries))

    def extract_from_file(
        self,
        file_content: bytes,
        filename: str,
        document_type: str = "auto"
    ) -> Dict[str, Any]:
        """
        Analyze a document using a Smart Hybrid Pipeline (Text-First -> Vision Fallback).
        - Digital PDFs (High Text Density) -> Text Only (Fast/Cheap)
        - Scanned PDFs / Images -> Vision (Robust/Comprehensive)
        """

        is_image = filename.lower().endswith(
            (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif")
        )

        # Strict JSON Schema System Prompt
        system_prompt = (
            "You are an expert Data Extraction AI for the Syntrax Enterprise Platform.\n"
            "Your Goal: Extract a strict JSON object from the document provided.\n\n"
            "Rules:\n"
            "1. Output ONLY valid JSON.\n"
            "2. **FORENSIC ACCURACY REQUIRED**: Extract data EXACTLY as it appears. Do not correct spelling. Do not normalize punctuation (commas, dots). If a table has a comma, keep it.\n"
            "3. **NO PLACEHOLDERS**: Never write '[Full content...]' or '[Rest of text]'. You MUST write out the full text, character by character, even if it is long.\n"
            "4. If the document is 20 pages, extract EVERY data point from ALL 20 pages. Do not skip later pages.\n"
            "5. 'full_text': Provide a verbatim transcription of the document content.\n"
            "5. 'extracted_data': Flat key-value pairs of EVERY field found.\n\n"
            "JSON Schema:\n"
            "{\n"
            '  "document_type": "string",\n'
            '  "confidence_score": float (0.0 to 1.0 based on data completeness),\n'
            '  "summary": "string (1-2 sentences)",\n'
            '  "full_text": "string (verbatim content of the document)",\n'
            '  "extracted_data": { "field_name": "value", ... },\n'
            '  "error_message": "string (optional, null if success)"\n'
            "}\n"
        )

        user_content = []
        is_vision_mode = False
        raw_text_fallback = "" # Capture raw text for fallback injection

        # ---------- IMAGE (Vision Mode) ----------
        if is_image:
            is_vision_mode = True
            encoded = base64.b64encode(file_content).decode("utf-8")
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{encoded}"
                }
            })
            user_content.append({"type": "text", "text": "Extract data from this image."})

        # ---------- PDF (Hybrid Mode) ----------
        elif filename.lower().endswith(".pdf"):
            try:
                doc = fitz.open(stream=file_content, filetype="pdf")
                
                # 1. Attempt Text Extraction
                full_text = ""
                for page in doc:
                    full_text += page.get_text()
                
                raw_text_fallback = full_text # Store for later

                # 2. Calculate Text Density (Characters per Page)
                page_count = len(doc)
                text_density = len(full_text) / page_count if page_count > 0 else 0
                
                # Threshold for "Digital PDF": > 50 chars/page usually means it's not just a wrapper for an image
                DIGITAL_PDF_THRESHOLD = 50 

                if text_density > DIGITAL_PDF_THRESHOLD:
                    # >>> FAST PATH: TEXT ONLY <<<
                    # Much cheaper and faster. LLMs are great at parsing text structure.
                    user_content.append({
                        "type": "text",
                        "text": f"Document Layout: Digital PDF (High Text Density).\n\nCONTENT:\n{full_text[:100000]}" # 100k char limit
                    })
                else:
                    # >>> ROBUST PATH: VISION <<<
                    # It's a scan or mostly images. Use Vision.
                    is_vision_mode = True
                    # Render first 3 pages max Use 1.5 zoom (approx 108 DPI) for balance of cost/quality
                    zoom = 1.5 
                    mat = fitz.Matrix(zoom, zoom)
                    
                    for i in range(min(20, len(doc))):
                        page = doc.load_page(i)
                        pix = page.get_pixmap(matrix=mat)
                        img_b64 = base64.b64encode(pix.tobytes("png")).decode()

                        user_content.append({
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{img_b64}"
                            }
                        })
                    
                    user_content.append({
                        "type": "text", 
                        "text": "This is a scanned document. Extract data from these visual pages."
                    })

            except Exception as e:
                return self._error(f"PDF processing failed: {str(e)}")

        # ---------- PLAIN TEXT/OTHER ----------
        else:
            try:
                text = file_content.decode("utf-8")
                user_content.append({
                    "type": "text",
                    "text": f"Document Content:\n{text[:50000]}"
                })
            except UnicodeDecodeError:
                return self._error("Unsupported binary file format.")

        # Construct Payload
        # Vision models often need a slightly tailored model ID, but Claude 3.5 Sonnet handles both well.
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "max_tokens": 8000,
            "temperature": 0.1, # Low temp for factual extraction
            "response_format": {"type": "json_object"}
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://syntrax.ai",
            "X-Title": "Syntrax.ai",
            "Content-Type": "application/json"
        }

        # Retry Logic
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                response = self.session.post(self.base_url, json=payload, headers=headers, timeout=180)
                
                # Check for specific error codes
                if response.status_code == 429:
                    raise requests.exceptions.RequestException("Rate limit exceeded")
                if response.status_code >= 500:
                    raise requests.exceptions.RequestException(f"Server error: {response.status_code}")
                
                response.raise_for_status()
                result = response.json()
                
                content = result["choices"][0]["message"]["content"]
                logging.info(f"Raw AI Response: {content[:200]}...") # Log start only

                # Strip Markdown Code Blocks
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                elif content.startswith("```"):
                    content = content[3:]
                
                if content.endswith("```"):
                    content = content[:-3]
                
                content = content.strip()
                
                # Simple metadata injection
                parsed_result = json.loads(content)
                parsed_result["_meta"] = {
                    "processing_mode": "vision" if is_vision_mode else "text_only",
                    "file_type": filename.split('.')[-1]
                }

                # Hybrid Fallback
                if raw_text_fallback and len(raw_text_fallback) > 100:
                    llm_text = parsed_result.get("full_text", "")
                    if len(str(llm_text)) < len(raw_text_fallback) * 0.5:
                        logging.info("Replacing lazy LLM full_text with raw text fallback.")
                        parsed_result["full_text"] = raw_text_fallback
                
                return parsed_result
                
            except (requests.RequestException, json.JSONDecodeError) as e:
                logging.warning(f"Attempt {attempt+1}/{max_retries} failed: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (2 ** attempt)) # Exponential backoff
                    continue
                else:
                    return self._error(f"Processing failed after {max_retries} attempts: {str(e)}")
            except (KeyError, IndexError):
                 return self._error("Malformed response structure from AI.")
            except Exception as e:
                return self._error(f"Unexpected error: {str(e)}")
                
        return self._error("Max retries exceeded")
    @staticmethod
    def _error(message: str) -> Dict[str, Any]:
        return {
            "error_message": message,
            "confidence_score": 0.0
        }


# Singleton

    def chat(self, messages: list) -> str:
        """
        Simple chat method for chatbot functionality.
        """
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://syntrax.ai",
                "X-Title": "Syntrax Chatbot"
            }
            
            response = self.session.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            response.raise_for_status()
            data = response.json()
            
            return data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logging.error(f"Chat error: {str(e)}")
            raise Exception(f"Failed to get chat response: {str(e)}")


openrouter_service = OpenRouterService()
