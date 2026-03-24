from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, dependencies
import stripe
import os
import uuid
from pydantic import BaseModel

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# Configuration
# In production, these would be in .env
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

stripe.api_key = STRIPE_SECRET_KEY

class CheckoutRequest(BaseModel):
    pack_id: str # 'starter' or 'pro'

@router.post("/create-checkout-session")
def create_checkout_session(request: CheckoutRequest, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Define Packs
    packs = {
        "starter": {"name": "Starter Pack (500 Credits)", "amount": 5000, "credits": 500}, # 50.00 EUR
        "pro": {"name": "Pro Pack (5000 Credits)", "amount": 40000, "credits": 5000},     # 400.00 EUR
    }
    
    if request.pack_id not in packs:
        raise HTTPException(status_code=400, detail="Invalid pack_id")
    
    pack = packs[request.pack_id]

    # SIMULATION MODE (If no valid key)
    if "sk_test_placeholder" in STRIPE_SECRET_KEY:
        print(f"⚠️ SIMULATION MODE: Skipping Real Stripe Checkout for {current_user.email}")
        # We generate a fake session ID that we can intercept on the success page
        fake_session_id = f"mock_session_{uuid.uuid4()}_{request.pack_id}"
        return {"url": f"{FRONTEND_URL}/billing/success?session_id={fake_session_id}&simulated=true"}

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': pack['name'],
                    },
                    'unit_amount': pack['amount'],
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/billing/cancel',
            client_reference_id=current_user.id,
            metadata={
                "user_id": current_user.id,
                "pack_id": request.pack_id,
                "credits": pack['credits']
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)):
    if "sk_test_placeholder" in STRIPE_SECRET_KEY:
        return {"status": "ignored_simulation"}

    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_success(session, db)

    return {"status": "success"}

def handle_checkout_success(session, db: Session):
    user_id = session.get("client_reference_id") or session.get("metadata", {}).get("user_id")
    credits_to_add = int(session.get("metadata", {}).get("credits", 0))
    
    if user_id and credits_to_add > 0:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.credits += credits_to_add
            # Log transaction?
            db.commit()
            print(f"💰 PAYMENT SUCCESS: Added {credits_to_add} credits to {user.email}")

# SIMULATION VERIFY ENDPOINT
class SimulateSuccessRequest(BaseModel):
    session_id: str

@router.post("/simulate-success")
def simulate_success(req: SimulateSuccessRequest, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    """
    Called by the frontend 'Success' page ONLY in dev/simulation mode
    to actually award the credits since there is no webhook.
    """
    if "mock_session" not in req.session_id:
        raise HTTPException(status_code=400, detail="Not a mock session")
    
    # Extract pack_id from the hacky session string "mock_session_{uuid}_{pack_id}"
    parts = req.session_id.split('_')
    pack_id = parts[-1] 
    
    credits_map = {"starter": 500, "pro": 5000}
    credits = credits_map.get(pack_id, 0)
    
    if credits > 0:
        current_user.credits += credits
        db.commit()
        return {"status": "credited", "new_balance": current_user.credits}
    
    return {"status": "error"}
