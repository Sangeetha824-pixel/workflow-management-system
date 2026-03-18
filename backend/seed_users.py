# seed_users.py — run once to create default users
# Usage: python seed_users.py
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password

USERS = [
    {"name":"Admin User",    "email":"admin@workflow.com",    "password":"Admin@123",    "role":"admin",    "department":"Management"},
    {"name":"HR Manager",    "email":"hr@workflow.com",       "password":"Hr@123456",    "role":"hr",       "department":"Human Resources"},
    {"name":"Team Manager",  "email":"manager@workflow.com",  "password":"Manager@123",  "role":"manager",  "department":"Engineering"},
    {"name":"John Employee", "email":"employee@workflow.com", "password":"Employee@123", "role":"employee", "department":"Engineering"},
]

def seed():
    db = SessionLocal()
    created = skipped = 0
    try:
        for u in USERS:
            if db.query(User).filter(User.email == u["email"]).first():
                print(f"  ⏭  Skipped  [{u['role']:8}]  {u['email']}")
                skipped += 1
                continue
            db.add(User(
                name=u["name"], email=u["email"],
                password=hash_password(u["password"]),
                role=u["role"], department=u["department"]
            ))
            db.commit()
            print(f"  ✅ Created  [{u['role']:8}]  {u['email']}  /  {u['password']}")
            created += 1
    finally:
        db.close()
    print(f"\n  Done — {created} created, {skipped} skipped.")

if __name__ == "__main__":
    print("\n🌱 Seeding users...\n")
    seed()