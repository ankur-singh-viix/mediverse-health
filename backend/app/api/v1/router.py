"""
API v1 router aggregator.

All feature-specific routers are included here under a single
versioned prefix. Future phases (patient, doctor, auth, AI modules)
will register their routers in this file without touching `app.main`.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
