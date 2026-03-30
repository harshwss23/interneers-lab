import os
import smtplib
from email.mime.text import MIMEText

def send_otp_email(to_email: str, otp: str):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    from_email = os.getenv("FROM_EMAIL", user)

    subject = "Your OTP Verification Code"
    body = f"Your OTP code is: {otp}\n\nThis OTP will expire soon. Do not share it."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.sendmail(from_email, [to_email], msg.as_string())