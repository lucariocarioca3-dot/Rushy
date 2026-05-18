import requests
import json

token = "sbp_b9ebed511668baab1423ca1906d52dd904efb8e7"
project_ref = "lblycbpbwokclsircdhq"
url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"

queries = [
    "DROP TABLE IF EXISTS employees CASCADE;",
    "CREATE TABLE employees (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, department TEXT NOT NULL, join_date TEXT NOT NULL, status TEXT NOT NULL);",
    "DROP TABLE IF EXISTS orders CASCADE;",
    "CREATE TABLE orders (id TEXT PRIMARY KEY, customer TEXT NOT NULL, product TEXT NOT NULL, quantity INTEGER NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, total TEXT NOT NULL);",
    "DROP TABLE IF EXISTS stock_items CASCADE;",
    "CREATE TABLE stock_items (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, quantity INTEGER NOT NULL, min_quantity INTEGER NOT NULL, unit TEXT NOT NULL, needs_restock BOOLEAN DEFAULT FALSE);",
    "DROP TABLE IF EXISTS suppliers CASCADE;",
    "CREATE TABLE suppliers (id TEXT PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL, email TEXT NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL);",
    "DROP TABLE IF EXISTS forms CASCADE;",
    "CREATE TABLE forms (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, rows INTEGER NOT NULL, columns INTEGER NOT NULL, data JSONB NOT NULL);",
    "ALTER TABLE employees DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE orders DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE stock_items DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE forms DISABLE ROW LEVEL SECURITY;"
]

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

for q in queries:
    response = requests.post(url, headers=headers, json={"query": q})
    print(f"Query: {q[:50]}... Status: {response.status_code}")
    if response.status_code != 201:
        print(f"Error: {response.text}")

# Reload schema
requests.post(url, headers=headers, json={"query": "NOTIFY pgrst, 'reload schema';"})
