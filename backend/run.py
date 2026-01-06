#!/usr/bin/env python
"""
Run script for the SAP Support Ticket Dashboard Backend
"""

import uvicorn
from app.core.config import settings


if __name__ == "__main__":
    print("=" * 60)
    print("SAP Support Ticket Dashboard - Backend Server")
    print("=" * 60)
    print(f"Host: {settings.host}")
    print(f"Port: {settings.port}")
    print(f"Debug: {settings.debug}")
    print(f"Docs: http://{settings.host}:{settings.port}/docs")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
