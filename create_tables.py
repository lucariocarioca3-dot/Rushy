import requests
import json

token = "sbp_b9ebed511668baab1423ca1906d52dd904efb8e7"
project_ref = "lblycbpbwokclsircdhq"
url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"

sql = """
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  join_date TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  total TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  needs_restock BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  data JSONB NOT NULL
);
"""

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, json={"query": sql})
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
