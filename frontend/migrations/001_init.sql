CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  next_run_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE job_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  status TEXT,
  http_status INTEGER,
  error TEXT,
  duration_ms INTEGER,
  attempt INTEGER NOT NULL DEFAULT 1
);