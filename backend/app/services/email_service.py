import resend
import os

# Configuration
# In production, use os.getenv("RESEND_API_KEY")
RESEND_API_KEY = "re_A3YzNbYH_9X8h7ushziHKJaQMENnXHNy1" 
resend.api_key = RESEND_API_KEY

FROM_EMAIL = "onboarding@resend.dev"

def send_welcome_email(to_email: str, name: str):
    try:
        html_content = f"""
        <h1>Welcome to Syntrax, {name}! 🚀</h1>
        <p>Your account has been successfully created.</p>
        <p><strong>To celebrate, we've added 50 Free Credits to your account!</strong></p>
        <p>You can start extracting documents right away.</p>
        <br>
        <p>Best regards,<br>The Syntrax Team</p>
        """
        
        r = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": "Welcome to Syntrax! 🎁",
            "html": html_content
        })
        print(f"Email sent to {to_email}: {r}")
        return r
    except Exception as e:
        print(f"Failed to send email: {e}")
        return None

def send_password_reset_email(to_email: str, reset_token: str):
    try:
        # For now, link points to a frontend route (we need to build the Reset Page handling the token)
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        
        html_content = f"""
        <h1>Reset Your Password</h1>
        <p>You requested a password reset for your Syntrax account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="{reset_link}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't ask for this, please ignore this email.</p>
        """
        
        r = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": "Reset your Syntrax Password 🔒",
            "html": html_content
        })
        return r
    except Exception as e:
        print(f"Failed to send reset email: {e}")
        return None
