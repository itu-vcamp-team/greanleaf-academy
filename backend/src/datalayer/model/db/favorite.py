import uuid
from sqlmodel import Field, UniqueConstraint
from src.datalayer.model.db.base import BaseModel


class Favorite(BaseModel, table=True):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "content_id", name="uq_user_favorite"),
    )

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    content_id: uuid.UUID = Field(foreign_key="academy_contents.id", index=True)
