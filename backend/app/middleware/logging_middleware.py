"""
Request logging middleware.

Logs every incoming request with method, path, status code, and
processing time, providing consistent observability across the API.
"""

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("mediverse.requests")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs request/response metadata and attaches a correlation ID."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()

        logger.info(
            "→ %s %s | request_id=%s", request.method, request.url.path, request_id
        )

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "← %s %s | status=%s | duration=%.2fms | request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
        return response
