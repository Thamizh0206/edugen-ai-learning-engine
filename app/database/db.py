import sqlite3
import hashlib
import json

def init_db():
    conn = sqlite3.connect("kai.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_cache (
            doc_hash TEXT PRIMARY KEY,
            response TEXT
        )
    """)

    conn.commit()
    conn.close()

def update_progress(user_id, topic, is_correct):
    conn = sqlite3.connect("kai.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT correct, wrong FROM user_progress
        WHERE user_id = ? AND topic = ?
    """, (user_id, topic))

    row = cursor.fetchone()

    if row:
        correct, wrong = row
        if is_correct:
            correct += 1
        else:
            wrong += 1

        cursor.execute("""
            UPDATE user_progress
            SET correct = ?, wrong = ?
            WHERE user_id = ? AND topic = ?
        """, (correct, wrong, user_id, topic))
    else:
        correct = 1 if is_correct else 0
        wrong = 0 if is_correct else 1

        cursor.execute("""
            INSERT INTO user_progress VALUES (?, ?, ?, ?)
        """, (user_id, topic, correct, wrong))

    conn.commit()
    conn.close()

import hashlib
import json

def get_doc_hash(text: str):
    return hashlib.sha256(text.encode()).hexdigest()

def get_cached_response(doc_hash):
    conn = sqlite3.connect("kai.db")
    cursor = conn.cursor()

    cursor.execute("SELECT response FROM document_cache WHERE doc_hash = ?", (doc_hash,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return json.loads(row[0])
    return None

def save_cache(doc_hash, response):
    conn = sqlite3.connect("kai.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT OR REPLACE INTO document_cache VALUES (?, ?)",
        (doc_hash, json.dumps(response))
    )

    conn.commit()
    conn.close()