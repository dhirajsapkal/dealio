"""
Database Configuration and Session Management
Handles PostgreSQL connection, session creation, and database initialization.
"""

import os
import logging
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Generator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://guitar_user:guitar_password@localhost:5432/guitar_deals"
)

# For local development, fallback to SQLite if PostgreSQL is not available
SQLITE_DATABASE_URL = "sqlite:///./guitar_deals.db"

# Create engine with connection pooling
# Use SQLite for development by default
logger.info("Using SQLite database for development")
engine = create_engine(
    SQLITE_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite specific
    echo=False  # Set to False to reduce logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models will be done in functions to avoid circular imports


def create_tables():
    """
    Create all database tables.
    Should be called on application startup.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Automatically handles session lifecycle and cleanup.
    
    Usage in FastAPI endpoints:
    ```python
    @app.get("/guitars/")
    def get_guitars(db: Session = Depends(get_db)):
        return db.query(GuitarListing).all()
    ```
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def get_db_session() -> Session:
    """
    Get a database session for use outside of FastAPI (e.g., in scrapers).
    Remember to close the session when done.
    
    Usage:
    ```python
    db = get_db_session()
    try:
        # Do database operations
        db.add(new_listing)
        db.commit()
    finally:
        db.close()
    ```
    """
    return SessionLocal()


def test_connection() -> bool:
    """
    Test database connection.
    Returns True if connection is successful, False otherwise.
    """
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False


def reset_database():
    """
    Drop and recreate all tables.
    WARNING: This will delete all data!
    Use only for development/testing.
    """
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        logger.info("Database reset completed")
    except SQLAlchemyError as e:
        logger.error(f"Error resetting database: {e}")
        raise


# Database initialization function
def init_database():
    """
    Initialize database connection and create tables.
    Call this on application startup.
    """
    logger.info("Initializing database...")
    
    # Test connection
    if not test_connection():
        raise Exception("Failed to connect to database")
    
    # Create tables
    create_tables()
    
    logger.info("Database initialization completed successfully")


# Context manager for database transactions
class DatabaseTransaction:
    """
    Context manager for database transactions.
    Automatically handles commit/rollback and session cleanup.
    
    Usage:
    ```python
    with DatabaseTransaction() as db:
        listing = GuitarListing(...)
        db.add(listing)
        # Transaction is automatically committed on exit
    ```
    """
    
    def __init__(self):
        self.db = None
    
    def __enter__(self) -> Session:
        self.db = SessionLocal()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # Exception occurred, rollback transaction
            self.db.rollback()
            logger.error(f"Transaction rolled back due to error: {exc_val}")
        else:
            # Success, commit transaction
            self.db.commit()
        
        self.db.close()
        return False  # Don't suppress exceptions


# Export commonly used items
__all__ = [
    'engine',
    'SessionLocal', 
    'get_db',
    'get_db_session',
    'create_tables',
    'init_database',
    'test_connection',
    'reset_database',
    'DatabaseTransaction'
] 