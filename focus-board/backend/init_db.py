#!/usr/bin/env python3
"""
Database initialization script for FocusBoard
Run this script to create all database tables
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import DATABASE_URL, create_tables
from models import Base

def init_database():
    """Initialize the database and create all tables"""
    print("Initializing FocusBoard database...")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Check if database exists, create if it doesn't
    if not database_exists(engine.url):
        print(f"Creating database: {engine.url}")
        create_database(engine.url)
        print("Database created successfully!")
    else:
        print("Database already exists.")
    
    # Create all tables
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully!")
    
    print("Database initialization completed!")

if __name__ == "__main__":
    init_database()
