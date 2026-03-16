import time
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from models.database import Base, engine
from api.request_routes import router as request_router
from api.audit_routes import router as audit_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(retries: int = 10, delay: int = 2) -> None:
    """Wait for PostgreSQL and create all tables."""
    for attempt in range(1, retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            logger.info("Database initialized successfully.")
            return
        except Exception as exc:
            logger.warning("DB not ready (attempt %d/%d): %s", attempt, retries, exc)
            if attempt == retries:
                raise
            time.sleep(delay)


init_db()

app = FastAPI(
    title="Operations Management Platform",
    description="Enterprise platform for digitalizing internal operations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(request_router)
app.include_router(audit_router)


@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
def health_check():
    return {"status": "ok"}
