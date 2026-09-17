import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


# =========================================================
# LOAD LOCAL ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# DATABASE CONNECTION
#
# Production:
#   Uses DATABASE_URL supplied by the hosting platform.
#
# Local development:
#   Falls back to DB_HOST, DB_PORT, DB_NAME,
#   DB_USER and DB_PASSWORD from the local .env file.
# =========================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)


if DATABASE_URL:
    # Some hosting providers may still supply the older
    # postgres:// prefix. SQLAlchemy expects postgresql://.
    if DATABASE_URL.startswith(
        "postgres://"
    ):
        DATABASE_URL = (
            DATABASE_URL.replace(
                "postgres://",
                "postgresql://",
                1,
            )
        )

else:
    DB_HOST = os.getenv(
        "DB_HOST",
        "localhost",
    )

    DB_PORT = os.getenv(
        "DB_PORT",
        "5432",
    )

    DB_NAME = os.getenv(
        "DB_NAME",
        "kenya_infrastructure_gis",
    )

    DB_USER = os.getenv(
        "DB_USER",
        "postgres",
    )

    DB_PASSWORD = os.getenv(
        "DB_PASSWORD"
    )


    if not DB_PASSWORD:
        raise RuntimeError(
            "Database credentials are missing. "
            "Set DATABASE_URL for production "
            "or DB_PASSWORD for local development."
        )


    DATABASE_URL = URL.create(
        drivername=(
            "postgresql+psycopg2"
        ),
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT),
        database=DB_NAME,
    )


# =========================================================
# SQLALCHEMY ENGINE
# =========================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# =========================================================
# DATABASE SESSION
# =========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# =========================================================
# SQLALCHEMY BASE
# =========================================================

Base = declarative_base()


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()