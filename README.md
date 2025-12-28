📘 Job Scheduler System

A scalable job scheduling system that allows users to create, modify, execute, and monitor recurring jobs using cron expressions. The system tracks execution history, retries failed jobs, and exposes metrics for observability.

🚀 Features

  Create and manage cron-based jobs

  Modify existing jobs (schedule or API endpoint)

  Enable / Disable jobs

  Execute jobs using a worker pool

  Retry failed executions with backoff

  View execution history per job

  Alert users on job failures (UI-level)

  Expose system metrics (latency, retries, drift)

🏗️ System Architecture

  The system consists of the following components:

  Frontend: React + Tailwind CSS

  Backend API: Node.js + Fastify

  Scheduler: Cron-based polling scheduler

  Execution Queue: In-memory queue

  Worker Pool: Concurrent job execution using Axios

  Database: PostgreSQL

Containerization: Docker & Docker Compose

📌 Assumptions Made

Jobs are executed via HTTP POST requests

Cron expressions must be valid

Failed jobs are retried up to a fixed maximum

Alerts are implemented at UI level (visual + browser alert)

Execution queue is in-memory (non-persistent)

Metrics are cumulative since system start

⚙️ Setup Instructions

1. Clone the Repository
 
       git clone https://github.com/shivraj-debug/job-scheduler.git

       cd job-scheduler


2️ Start Backend Services (Docker)

    cd backend

    docker compose up --build

3 Start Frontend (React + Vite)

    cd frontend

    npm install

    npm run dev






