"""
Generic base repository implementing the Repository Pattern.

Encapsulates common CRUD operations so feature-specific repositories
only need to add domain-specific queries. This keeps the Service Layer
decoupled from SQLAlchemy internals.
"""

import uuid
from typing import Generic, Sequence, Type, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic repository providing common persistence operations."""

    def __init__(self, model: Type[ModelType], db: Session) -> None:
        self.model = model
        self.db = db

    def get_by_id(self, entity_id: uuid.UUID) -> ModelType | None:
        """Fetch a single record by its primary key."""
        return self.db.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        """Fetch a paginated list of records."""
        statement = select(self.model).offset(skip).limit(limit)
        return self.db.execute(statement).scalars().all()

    def create(self, obj_in: ModelType) -> ModelType:
        """Persist a new record."""
        self.db.add(obj_in)
        self.db.commit()
        self.db.refresh(obj_in)
        return obj_in

    def update(self, obj: ModelType) -> ModelType:
        """Persist changes to an existing record."""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        """Remove a record from the database."""
        self.db.delete(obj)
        self.db.commit()
