
import { pool } from "../persistence/db";
import parseExpression from "cron-parser";
import { executionQueue } from "../executor/execution.queue";
import { logger } from "../logger";

const SCHEDULER_INTERVAL_MS = 500;
const BATCH_SIZE = 100;

export function startScheduler() {
  setInterval(runSchedulerTick, SCHEDULER_INTERVAL_MS);
}

async function runSchedulerTick() {
  logger.debug("Scheduler tick Started");
  const now = new Date();

  const { rows: jobs } = await pool.query(
    `
    SELECT id, schedule, api_endpoint, next_run_at
    FROM jobs
    WHERE is_active = true
      AND next_run_at <= $1
    ORDER BY next_run_at
    LIMIT $2
    `,
    [now, BATCH_SIZE]
  );

  for (const job of jobs) {
    await tryScheduleJob(job);
  }
}

async function tryScheduleJob(job: any) {
  logger.info(
    {
      jobId: job.id,
      job
    },
    "Job scheduled"
  );

  const scheduledAt = job.next_run_at;

  // Compute next run from the scheduled time (NOT now)
  const interval = parseExpression.parse(job.schedule, {
    currentDate: scheduledAt
  });
  const nextRunAt = interval.next().toDate();

  // Atomically claim the job
  const result = await pool.query(
    `
    UPDATE jobs
    SET next_run_at = $1
    WHERE id = $2
      AND next_run_at = $3
    `,
    [nextRunAt, job.id, scheduledAt]
  );

  if (result.rowCount === 0) {
    // Another scheduler instance already claimed it
    logger.debug(
      { jobId: job.id },
      "Job already claimed by another scheduler"
    );

    return;
  }

  // Persist execution intent
  const execResult = await pool.query(
    `
    INSERT INTO job_executions (
      job_id,
      scheduled_at,
      status,
      attempt
    )
    VALUES ($1, $2, 'PENDING', 1)
    RETURNING id
    `,
    [job.id, scheduledAt]
  );

  const executionId = execResult.rows[0].id;

  // Enqueue for execution
  executionQueue.enqueue({
    executionId,
    jobId: job.id,
    apiEndpoint: job.api_endpoint,
    scheduledAt,
    attempt: 1
  });
}