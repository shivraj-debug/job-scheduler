import axios from "axios";
import { logger } from "../logger";
import { pool } from "../persistence/db";
import { ExecutionTask } from "../types/execution.types";

const REQUEST_TIMEOUT_MS = 5000;

export async function executeTask(task: ExecutionTask) {
  logger.info(
    {
      executionId: task.executionId,
      jobId: task.jobId,
      attempt: task.attempt
    },
    "Execution started"
  );

  const startedAt = new Date();

  await pool.query(
    `UPDATE job_executions
     SET status = 'RUNNING', started_at = $1
     WHERE id = $2`,
    [startedAt, task.executionId]
  );

  try {
    const response = await axios.post(
      task.apiEndpoint,
      {},
      { timeout: REQUEST_TIMEOUT_MS }
    );

    const finishedAt = new Date();

    await pool.query(
      `UPDATE job_executions
       SET status = 'SUCCESS',
           http_status = $1,
           finished_at = $2,
           duration_ms = $3
       WHERE id = $4`,
      [
        response.status,
        finishedAt,
        finishedAt.getTime() - startedAt.getTime(),
        task.executionId
      ]
    );
    
    logger.info(
      {
        executionId: task.executionId,
        jobId: task.jobId,
        status: response.status,
        duration_ms: finishedAt.getTime() - startedAt.getTime()
      },
      "Execution succeeded"
    );
  } catch (err: any) {
    const finishedAt = new Date();

    await pool.query(
      `UPDATE job_executions
       SET status = 'FAILED',
           error = $1,
           finished_at = $2,
           duration_ms = $3
       WHERE id = $4`,
      [
        err.message,
        finishedAt,
        finishedAt.getTime() - startedAt.getTime(),
        task.executionId
      ]
    );
    
    logger.error(
      {
        executionId: task.executionId,
        jobId: task.jobId,
        attempt: task.attempt,
        error: err.message
      },
      "Execution failed"
    );

    throw err;
  }
}