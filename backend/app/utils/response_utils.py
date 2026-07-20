"""
Response utility helpers.

Small helpers for building consistent success response envelopes.
"""

from typing import Any


def success_response(data: Any = None, message: str = "Success") -> dict:
    """Wrap response data in a consistent success envelope."""
    return {
        "success": True,
        "message": message,
        "data": data,
    }
