from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.openrouter_service import openrouter_service

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    language: Optional[str] = "en"  # 'en' or 'fr'

class ChatResponse(BaseModel):
    message: str

# System context about Syntrax
SYSTEM_CONTEXT_EN = """You are a helpful AI assistant for Syntrax.ai, an enterprise-grade document extraction platform.

About Syntrax:
- Syntrax uses state-of-the-art LLMs (Claude 3.5 Sonnet, GPT-4o) to extract structured data from unstructured documents
- Supports PDF, PNG, JPG formats with 99.9% accuracy
- Offers three pricing tiers: Starter (Free, 50 docs/month), Growth ($99/month, 1000 docs/month), Scale (Custom pricing, unlimited)
- Features: Multi-modal extraction, OCR, NLP, webhooks, API access, CSV/JSON export
- Enterprise features: SSO, audit logs, private hosting, guaranteed SLA, 24/7 support
- Security: SOC2 compliant, end-to-end encryption, data stays in user's region (EU/US)

Key capabilities:
- Upload documents via API or dashboard
- Automatic AI-powered data extraction
- Real-time processing with confidence scores
- Export to ERP, CRM, or databases
- Full API documentation available

Answer user questions about Syntrax features, pricing, capabilities, and how to use the platform. Be concise, helpful, and professional."""

SYSTEM_CONTEXT_FR = """Vous êtes un assistant IA utile pour Syntrax.ai, une plateforme d'extraction de documents de niveau entreprise.

À propos de Syntrax:
- Syntrax utilise des LLMs de pointe (Claude 3.5 Sonnet, GPT-4o) pour extraire des données structurées de documents non-structurés
- Supporte les formats PDF, PNG, JPG avec 99,9% de précision
- Offre trois niveaux tarifaires: Starter (Gratuit, 50 docs/mois), Growth (99€/mois, 1000 docs/mois), Scale (Prix personnalisé, illimité)
- Fonctionnalités: Extraction multi-modale, OCR, NLP, webhooks, accès API, export CSV/JSON
- Fonctionnalités entreprise: SSO, logs d'audit, hébergement privé, SLA garanti, support 24/7
- Sécurité: Conforme SOC2, chiffrement bout-en-bout, données restent dans la région de l'utilisateur (EU/US)

Capacités clés:
- Téléchargement de documents via API ou tableau de bord
- Extraction de données automatique par IA
- Traitement en temps réel avec scores de confiance
- Export vers ERP, CRM ou bases de données
- Documentation API complète disponible

Répondez aux questions des utilisateurs sur les fonctionnalités, tarifs, capacités de Syntrax et comment utiliser la plateforme. Soyez concis, utile et professionnel."""

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Chat endpoint that uses OpenRouter to answer questions about Syntrax.
    """
    try:
        # Select system context based on language
        system_context = SYSTEM_CONTEXT_FR if request.language == "fr" else SYSTEM_CONTEXT_EN
        
        # Build messages for OpenRouter
        messages = [
            {"role": "system", "content": system_context}
        ]
        
        # Add conversation history
        for msg in request.messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Call OpenRouter
        response = openrouter_service.chat(messages)
        
        return ChatResponse(message=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
