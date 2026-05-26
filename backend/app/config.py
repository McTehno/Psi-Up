import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "psi_up")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")