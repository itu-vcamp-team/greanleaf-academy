from datetime import datetime, timezone, timedelta
import uuid as uuid_lib


def generate_cancellation_ics(
    title: str,
    start_time: datetime,
    end_time: datetime | None,
    organizer_email: str = "noreply@greenleafakademi.com",
) -> str:
    """
    Generates a CANCELLED iCalendar (.ics) event with METHOD:CANCEL.
    Sent alongside event cancellation emails so calendar apps remove the event.
    """
    uid = str(uuid_lib.uuid4())

    now_utc = datetime.now(timezone.utc)
    now_str = now_utc.strftime("%Y%m%dT%H%M%SZ")

    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    start_str = start_time.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    if end_time:
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        end_str = end_time.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    else:
        end_str = (start_time + timedelta(hours=1)).astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    ics_content = (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        "PRODID:-//Greenleaf Akademi//TR\r\n"
        "METHOD:CANCEL\r\n"
        "BEGIN:VEVENT\r\n"
        f"UID:{uid}\r\n"
        f"DTSTAMP:{now_str}\r\n"
        f"DTSTART:{start_str}\r\n"
        f"DTEND:{end_str}\r\n"
        f"SUMMARY:{title} (İPTAL EDİLDİ)\r\n"
        "DESCRIPTION:Bu etkinlik iptal edilmiştir.\r\n"
        f"ORGANIZER;CN=Greenleaf Akademi:mailto:{organizer_email}\r\n"
        "STATUS:CANCELLED\r\n"
        "SEQUENCE:1\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )
    return ics_content

def generate_ics(
    title: str,
    description: str | None,
    start_time: datetime,
    end_time: datetime | None,
    location: str | None,
    meeting_link: str | None,
    organizer_email: str = "noreply@greenleafakademi.com",
) -> str:
    """
    Generates an RFC 5545 compliant .ics (iCalendar) content.
    Used for "Add to Calendar" features.
    """
    uid = str(uuid_lib.uuid4())
    
    # Format times for .ics (YYYYMMDDTHHMMSSZ)
    now_utc = datetime.now(timezone.utc)
    now_str = now_utc.strftime("%Y%m%dT%H%M%SZ")
    
    # If starting time doesn't have timezone, assume UTC for .ics
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    
    start_str = start_time.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    if end_time:
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        end_str = end_time.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    else:
        # Default duration: 1 hour
        end_str = (start_time + timedelta(hours=1)).astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    # Sanitize and prepare description
    desc_parts = []
    if description:
        desc_parts.append(description)
    if meeting_link:
        desc_parts.append(f"Meeting Link: {meeting_link}")
    
    # Escape special characters in description
    description_text = "\\n".join(desc_parts).replace(",", "\\,").replace(";", "\\;")

    # Location handling
    loc_line = ""
    if location:
        loc_line = f"LOCATION:{location}\r\n"
    elif meeting_link:
        loc_line = f"LOCATION:{meeting_link}\r\n"

    ics_content = (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        "PRODID:-//Greenleaf Akademi//TR\r\n"
        "METHOD:PUBLISH\r\n"
        "BEGIN:VEVENT\r\n"
        f"UID:{uid}\r\n"
        f"DTSTAMP:{now_str}\r\n"
        f"DTSTART:{start_str}\r\n"
        f"DTEND:{end_str}\r\n"
        f"SUMMARY:{title}\r\n"
        f"DESCRIPTION:{description_text}\r\n"
        f"{loc_line}"
        f"ORGANIZER;CN=Greenleaf Akademi:mailto:{organizer_email}\r\n"
        "STATUS:CONFIRMED\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )

    return ics_content
