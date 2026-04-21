import uuid
from typing import List, Optional
from datetime import datetime
from src.datalayer.repository.event_repository import EventRepository
from src.datalayer.model.db.event import Event, EventVisibility
from src.services.mailing_service import MailingService
from src.services.image_service import ImageService
from fastapi import UploadFile

class EventService:
    """Service layer for event-related business logic."""

    def __init__(self, repo: EventRepository):
        self.repo = repo

    async def create_event(self, data: dict, cover_image: Optional[UploadFile] = None) -> Event:
        """Handles event creation with optional cover image."""
        if cover_image:
            image_path = await ImageService.save_image(cover_image, "events")
            data["cover_image_path"] = image_path
        
        event = Event(**data)
        return await self.repo.save(event)

    async def update_event(self, event_id: uuid.UUID, data: dict, cover_image: Optional[UploadFile] = None) -> Event:
        """Updates event and handles image replacement if new image is provided."""
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")

        if cover_image:
            # Delete old image if exists
            if event.cover_image_path:
                ImageService.delete_image(event.cover_image_path)
            # Save new image
            data["cover_image_path"] = await ImageService.save_image(cover_image, "events")

        for key, value in data.items():
            if hasattr(event, key):
                setattr(event, key, value)
        
        return await self.repo.save(event)

    async def publish_event(self, event_id: uuid.UUID, notify_partners: bool = False) -> Event:
        """Publishes an event and optionally notifies partners via background task/service."""
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")

        event.is_published = True
        saved_event = await self.repo.save(event)

        if notify_partners:
            emails = await self.repo.get_partner_emails_for_announcement()
            if emails:
                # This will be called from the route to use background tasks
                # but we return the emails list here to the controller
                pass 
                
        return saved_event

    async def delete_event(self, event_id: uuid.UUID) -> bool:
        """Deletes event and its cover image."""
        event = await self.repo.get_by_id(event_id)
        if not event:
            return False

        if event.cover_image_path:
            ImageService.delete_image(event.cover_image_path)
            
        return await self.repo.delete_by_id(event_id)
