import sqlite3

conn = sqlite3.connect(
    "jeevandhara.db",
    check_same_thread=False
)

cursor = conn.cursor()

# Farmers Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS farmers(

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT UNIQUE,
    password TEXT,

    name TEXT,

    age INTEGER,
    income REAL,
    land_size REAL,

    state TEXT,
    district TEXT
)
""")

# Chat History Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS chat_history(

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER,

    question TEXT,
    answer TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()