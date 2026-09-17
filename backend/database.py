import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# DATABASE SETTINGS
# =========================================================

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
    "DB_PASSWORD",
)


# =========================================================
# VALIDATE DATABASE PASSWORD
# =========================================================

if not DB_PASSWORD:
    raise RuntimeError(
        "DB_PASSWORD is missing from the .env file."
    )


# =========================================================
# DATABASE URL
#
# SQLAlchemy URL.create() safely handles passwords
# containing characters such as:
#
# @
# #
# :
# /
# %
#
# We therefore do not manually construct the URL.
# =========================================================

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",

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
# BASE CLASS
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