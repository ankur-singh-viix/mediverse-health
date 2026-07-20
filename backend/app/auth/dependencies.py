"""
Authentication dependencies (structure only).

These FastAPI dependencies define the shape of future auth guards
(e.g. `get_current_user`, `require_role`). They are not wired into any
route yet - that will happen once the authentication module is
implemented in a later phase.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db


def get_current_user_placeholder(db: Session = Depends(get_db)) -> None:
    """
    Reserved dependency slot for extracting the authenticated user from
    a bearer token. Intentionally unimplemented in Phase 0.
    """
    raise NotImplementedError(
        "Authentication is not implemented in Phase 0. "
        "This dependency is reserved for a future phase."
    )
