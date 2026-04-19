import resend
from src.config import get_settings
from src.logger import logger

settings = get_settings()
resend.api_key = settings.RESEND_API_KEY


class MailingService:
    """
    Service for sending various HTML emails using Resend SDK.
    """
    MAIL_FROM_NAME = "Greenleaf Akademi"
    FROM_ADDRESS = f"{MAIL_FROM_NAME} <{settings.MAIL_FROM_ADDRESS}>"

    @staticmethod
    async def _send_email(
        to: str | list[str],
        subject: str,
        html: str,
        attachments: list[dict] | None = None,
    ) -> bool:
        """Base email sending logich."""
        if not settings.RESEND_API_KEY:
            logger.warning(f"RESEND_API_KEY not set. Skipping mail to {to}. Subject: {subject}")
            if settings.APP_ENV == "development":
                logger.debug(f"Email Content: {html}")
            return True

        try:
            params = {
                "from": MailingService.FROM_ADDRESS,
                "to": [to] if isinstance(to, str) else to,
                "subject": subject,
                "html": html,
            }
            if attachments:
                params["attachments"] = attachments

            resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to} | Subject: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to} | Error: {e}")
            return False

    @staticmethod
    async def send_activation_email(to_email: str, code: str, full_name: str) -> bool:
        """Sends OTP for email verification after registration step 3."""
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4AA435;">Greenleaf Akademi – E-posta Doğrulama</h2>
          <p>Merhaba <strong>{full_name}</strong>,</p>
          <p>Greenleaf Akademi'ye hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
          <div style="background: #f0f9f4; border: 2px solid #4AA435; border-radius: 8px;
                      padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                         color: #4AA435;">{code}</span>
          </div>
          <p style="color: #666;">Bu kod <strong>10 dakika</strong> geçerlidir.</p>
        </div>
        """
        return await MailingService._send_email(to_email, "E-posta Doğrulama Kodunuz", html)

    @staticmethod
    async def send_welcome_email(to_email: str, full_name: str, partner_id: str) -> bool:
        """Sends welcome message after account is approved."""
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4AA435;">Greenleaf Akademi'ye Hoş Geldiniz! 🌿</h2>
          <p>Merhaba <strong>{full_name}</strong>,</p>
          <p>Hesabınız onaylandı! Artık tüm eğitimlere erişebilirsiniz.</p>
          <div style="background: #f0f9f4; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Partner ID'niz:</strong> {partner_id}</p>
          </div>
        </div>
        """
        return await MailingService._send_email(to_email, "Hesabınız Onaylandı", html)

    @staticmethod
    async def send_monthly_2fa_email(to_email: str, code: str, full_name: str) -> bool:
        """Sends OTP for monthly security verification."""
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4AA435;">Güvenlik Doğrulama Kodu</h2>
          <p>Merhaba <strong>{full_name}</strong>,</p>
          <div style="background: #f0f9f4; border-radius: 8px; padding: 20px; text-align: center;">
            <span style="font-size: 36px; font-weight: bold; color: #4AA435;">{code}</span>
          </div>
        </div>
        """
        return await MailingService._send_email(to_email, "Güvenlik Doğrulaması", html)

    @staticmethod
    async def send_password_reset_email(to_email: str, code: str, full_name: str) -> bool:
        """Sends OTP for password reset."""
        html = f"<div>Şifre sıfırlama kodunuz: {code}</div>"
        return await MailingService._send_email(to_email, "Şifre Sıfırlama", html)

    @staticmethod
    async def send_calendar_invite_email(to_email: str, event_title: str, ics_content: str) -> bool:
        """Sends email with .ics attachment."""
        import base64
        ics_b64 = base64.b64encode(ics_content.encode("utf-8")).decode("utf-8")
        attachments = [{"filename": f"{event_title}.ics", "content": ics_b64, "content_type": "text/calendar"}]
        html = f"<div>Takvim Daveti: {event_title}</div>"
        return await MailingService._send_email(to_email, f"Takvim Daveti: {event_title}", html, attachments=attachments)

    @staticmethod
    async def send_event_announcement_email(recipient_emails: list[str], event_title: str, event_description: str | None, start_time, meeting_link: str | None, location: str | None) -> bool:
        """Broadcasts event details."""
        html = f"<div>Yeni Etkinlik: {event_title}</div>"
        BATCH_SIZE = 50
        success = True
        for i in range(0, len(recipient_emails), BATCH_SIZE):
            batch = recipient_emails[i:i + BATCH_SIZE]
            res = await MailingService._send_email(batch, f"Yeni Etkinlik: {event_title}", html)
            if not res: success = False
        return success

    @staticmethod
    async def send_waitlist_notification_to_admin(admin_emails: list[str], applicant_name: str, applicant_email: str, supervisor_name: str | None) -> bool:
        """Notifies admins of new waitlist."""
        html = f"<div>Yeni Başvuru: {applicant_name} ({applicant_email})</div>"
        return await MailingService._send_email(admin_emails, "Yeni Üyelik Başvurusu", html)

    @staticmethod
    async def send_account_status_email(to_email: str, full_name: str, is_approved: bool, rejection_reason: str | None = None) -> bool:
        """Notifies user about account status."""
        html = f"<div>Hesap durumunuz güncellendi. Onay: {is_approved}</div>"
        return await MailingService._send_email(to_email, "Hesap Durumu", html)
