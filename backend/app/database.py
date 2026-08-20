import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("career_os.database")
logging.basicConfig(level=logging.INFO)

# Default to Postgres if running locally, otherwise fallback to SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://mohitupraity@localhost/career_os"
)

Base = declarative_base()
SessionLocal = None
engine = None

# Attempt to configure PostgreSQL first
try:
    if DATABASE_URL.startswith("postgresql"):
        logger.info(f"Attempting to connect to PostgreSQL at {DATABASE_URL}...")
        # Add a short timeout to fail fast if PG is stopped
        engine = create_engine(
            DATABASE_URL, 
            connect_args={"connect_timeout": 3}
        )
        # Test connection
        conn = engine.connect()
        conn.close()
        logger.info("Successfully connected to PostgreSQL database!")
    else:
        raise ValueError("Non-postgres URL provided")
except Exception as e:
    logger.warning(
        f"PostgreSQL connection failed ({e}). Falling back to local SQLite database."
    )
    # Falling back to SQLite
    sqlite_db_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "career_os.db")
    )
    DATABASE_URL = f"sqlite:///{sqlite_db_path}"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
    logger.info(f"Using SQLite database at: {sqlite_db_path}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
