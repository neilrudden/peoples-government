-- Daily Referendum editorial queue.
-- Apply this file to the Cloudflare D1 database bound as DR_DB.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '',
  sources_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  editor_notes TEXT NOT NULL DEFAULT '',
  scheduled_for TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  approved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_suggestions_status_date
  ON suggestions(status, scheduled_for);

CREATE TABLE IF NOT EXISTS editorial_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suggestion_id INTEGER NOT NULL REFERENCES suggestions(id),
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_editorial_audit_suggestion
  ON editorial_audit(suggestion_id, created_at);
