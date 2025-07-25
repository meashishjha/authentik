"""email utils"""

from email.mime.image import MIMEImage
from functools import lru_cache
from pathlib import Path

from django.core.mail import EmailMultiAlternatives
from django.core.mail.message import sanitize_address
from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import render_to_string
from django.utils import translation


@lru_cache
def logo_data() -> MIMEImage:
    """Get logo as MIME Image for emails"""
    path = Path("web/icons/icon_left_brand.png")
    if not path.exists():
        path = Path("web/dist/assets/icons/icon_left_brand.png")
    with open(path, "rb") as _logo_file:
        logo = MIMEImage(_logo_file.read())
    logo.add_header("Content-ID", "<logo>")
    logo.add_header("Content-Disposition", "inline", filename="logo.png")
    return logo


class TemplateEmailMessage(EmailMultiAlternatives):
    """Wrapper around EmailMultiAlternatives with integrated template rendering"""

    def __init__(
        self, to: list[tuple[str]], template_name=None, template_context=None, language="", **kwargs
    ):
        sanitized_to = []
        # Ensure that all recipients are valid
        for recipient_name, recipient_email in to:
            # Remove any newline characters from name and email before sanitizing
            clean_name = (
                recipient_name.replace("\n", " ").replace("\r", " ") if recipient_name else ""
            )
            clean_email = (
                recipient_email.replace("\n", "").replace("\r", "") if recipient_email else ""
            )
            sanitized_to.append(sanitize_address((clean_name, clean_email), "utf-8"))
        super().__init__(to=sanitized_to, **kwargs)
        if not template_name:
            return
        with translation.override(language):
            html_content = render_to_string(template_name, template_context)
            try:
                text_content = render_to_string(
                    template_name.replace("html", "txt"), template_context
                )
                self.body = text_content
            except TemplateDoesNotExist:
                pass
        self.mixed_subtype = "related"
        self.attach_alternative(html_content, "text/html")
