from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# Dialect-aware engine setup: SQLite (zero-infra default) or MySQL/Postgres.
url = settings.DATABASE_URL
connect_args: dict = {}

if url.startswith("sqlite"):
    # SQLite needs this to be usable across FastAPI's threadpool.
    connect_args = {"check_same_thread": False}
    # Ensure the parent directory for the .db file exists.
    db_path = url.split("///", 1)[-1]
    if db_path and db_path != ":memory:":
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
else:
    # MySQL via PyMySQL (kept for production parity).
    import pymysql

    pymysql.install_as_MySQLdb()

engine = create_engine(url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
