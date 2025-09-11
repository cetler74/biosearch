#!/usr/bin/env python3
"""
Script to migrate data from SQLite to PostgreSQL
Run this script after setting up PostgreSQL database
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.app import app, db
from backend.app import User, Salon, Service, SalonService, Review, Booking, SalonImage
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def migrate_data():
    """Migrate data from SQLite to PostgreSQL"""
    
    # Get database URLs
    sqlite_url = os.getenv('SQLITE_DATABASE_URL', 'sqlite:///~/biosearch.db')
    postgres_url = os.getenv('DATABASE_URL')
    
    if not postgres_url:
        print("❌ DATABASE_URL environment variable not set!")
        print("Please set DATABASE_URL to your PostgreSQL connection string")
        return
    
    print("🔄 Starting data migration from SQLite to PostgreSQL...")
    
    # Create engines
    sqlite_engine = create_engine(sqlite_url)
    postgres_engine = create_engine(postgres_url)
    
    try:
        # Test PostgreSQL connection
        with postgres_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ PostgreSQL connection successful")
        
        # Test SQLite connection
        with sqlite_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ SQLite connection successful")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    # Create tables in PostgreSQL
    print("📋 Creating tables in PostgreSQL...")
    with app.app_context():
        db.create_all()
        print("✅ Tables created successfully")
    
    # Migrate data table by table
    tables_to_migrate = [
        ('users', User),
        ('salons', Salon),
        ('services', Service),
        ('salon_services', SalonService),
        ('reviews', Review),
        ('bookings', Booking),
        ('salon_images', SalonImage)
    ]
    
    for table_name, model_class in tables_to_migrate:
        try:
            print(f"📦 Migrating {table_name}...")
            
            # Read data from SQLite
            with sqlite_engine.connect() as conn:
                df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
            
            if df.empty:
                print(f"   ⚠️  No data found in {table_name}")
                continue
            
            # Insert data into PostgreSQL
            with postgres_engine.connect() as conn:
                df.to_sql(table_name, conn, if_exists='append', index=False, method='multi')
            
            print(f"   ✅ Migrated {len(df)} records from {table_name}")
            
        except Exception as e:
            print(f"   ❌ Error migrating {table_name}: {e}")
            continue
    
    print("🎉 Data migration completed!")
    print("\n📊 Migration Summary:")
    
    # Verify migration
    with postgres_engine.connect() as conn:
        for table_name, _ in tables_to_migrate:
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                print(f"   {table_name}: {count} records")
            except Exception as e:
                print(f"   {table_name}: Error - {e}")

if __name__ == "__main__":
    migrate_data()
