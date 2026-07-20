"""
Generic base service implementing the Service Layer Pattern.

Services own business logic and orchestrate one or more repositories.
Feature-specific services should inherit from this class and extend it
with domain rules. Controllers (API routers) must never talk to
repositories directly - only through services.
"""

import uuid
from typing import Generic, Sequence, TypeVar

from app.repositories.base_repository import BaseRepository

ModelType = TypeVar("ModelType")


class BaseService(Generic[ModelType]):
    """Generic service providing common orchestration over a repository."""

    def __init__(self, repository: BaseRepository) -> None:
        self.repository = repository

    def get_by_id(self, entity_id: uuid.UUID) -> ModelType | None:
        return self.repository.get_by_id(entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        return self.repository.get_all(skip=skip, limit=limit)

    def create(self, obj_in: ModelType) -> ModelType:
        return self.repository.create(obj_in)

    def update(self, obj: ModelType) -> ModelType:
        return self.repository.update(obj)

    def delete(self, obj: ModelType) -> None:
        self.repository.delete(obj)
