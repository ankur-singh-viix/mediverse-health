"""
Import hub for all SQLAlchemy models.

Alembic's `env.py` imports this module so that `Base.metadata` is aware
of every model in the project when generating migrations. As new models
are added in future phases, import them here.
"""

from app.db.base import Base  # noqa: F401
from app.models.user import User  # noqa: F401
