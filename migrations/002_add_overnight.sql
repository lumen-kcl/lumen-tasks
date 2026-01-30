-- Add overnight column for tasks Lumen works on autonomously while Ben sleeps
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS overnight BOOLEAN DEFAULT false;

-- Index for efficient overnight task queries
CREATE INDEX IF NOT EXISTS idx_tasks_overnight ON tasks(overnight) WHERE overnight = true;
