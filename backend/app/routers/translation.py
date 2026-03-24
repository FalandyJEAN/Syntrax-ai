from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from app.services.openrouter_service import call_openrouter

router = APIRouter(prefix="/translate", tags=["translation"])

class TranslationRequest(BaseModel):
    text: str
    target_language: Literal["en", "fr"]
    source_language: Literal["en", "fr"] = "en"

class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str

@router.post("/", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text using LLM API
    """
    if request.source_language == request.target_language:
        return TranslationResponse(
            translated_text=request.text,
            source_language=request.source_language,
            target_language=request.target_language
        )
    
    language_names = {
        "en": "English",
        "fr": "French"
    }
    
    prompt = f"""Translate the following text from {language_names[request.source_language]} to {language_names[request.target_language]}.
Only return the translated text, nothing else. Preserve HTML tags and formatting if present.

Text to translate:
{request.text}"""

    try:
        translated = await call_openrouter(
            prompt=prompt,
            model="anthropic/claude-3.5-sonnet",
            max_tokens=2000
        )
        
        return TranslationResponse(
            translated_text=translated.strip(),
            source_language=request.source_language,
            target_language=request.target_language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
