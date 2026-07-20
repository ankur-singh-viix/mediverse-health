"""
SQLAlchemy declarative base.

All ORM models must inherit from `Base`. This module is also the import
target for Alembic autogeneration, so every model module should be
imported in `app/db/base_import.py` to ensure Alembic can detect it.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass
