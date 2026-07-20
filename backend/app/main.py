"""
MediVerse AI - FastAPI application entry point.

Phase 0: Foundation only. Wires together configuration, logging,
middleware, exception handlers, and the versioned API router. No
business features are implemented yet.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.exceptions.handlers import register_exception_handlers
from app.middleware.logging_middleware import RequestLoggingMiddleware

configure_logging()
logger = get_logger(__name__)


def create_application() -> FastAPI:
    """Application factory - builds and configures the FastAPI instance."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Role-Based AI Healthcare Platform API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ------------------------------------------------------------------
    # Middleware
    # ------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    # ------------------------------------------------------------------
    # Exception handlers
    # ------------------------------------------------------------------
    register_exception_handlers(app)

    # ------------------------------------------------------------------
    # Routers
    # ------------------------------------------------------------------
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info(
            "%s starting up | env=%s | debug=%s",
            settings.APP_NAME,
            settings.APP_ENV,
            settings.DEBUG,
        )

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        logger.info("%s shutting down", settings.APP_NAME)

    return app


app = create_application()
