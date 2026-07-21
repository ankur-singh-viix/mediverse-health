"""
Authentication & authorization module.

Implements JWT-based authentication: token issuance/validation
(`jwt_handler`) and FastAPI dependencies for extracting the current
user and enforcing role-based access control (`dependencies`).
"""
