import { executionQueue } from "./execution.queue";
import { executeTask } from "./executor";
import { ExecutionTask } from "../types/execution.types";
import { pool } from "../persistence/db";
import { logger } from "../logger";

const WORKER_COUNT = 20;
const MAX_ATTEMPTS = 3;

export function startWorkerPool() {
  for (let i = 0; i < WORKER_COUNT; i++) {
    startWorker(i);
  }
}

async function startWorker(workerId: number) {
  
  logger.info({ workerId }, "Worker started");
  
  while (true) {
    const task = await executionQueue.dequeue();

    logger.debug(
      {
        workerId,
        executionId: task.executionId
      },
      "Worker picked up task"
    );
    
    try {
      await executeTask(task);
    } catch (err) {
      await handleRetry(task);
    }
  }
}

async function handleRetry(task: ExecutionTask) {
  if (task.attempt >= MAX_ATTEMPTS) {
    return;
  }
  
  const nextAttempt = task.attempt + 1;

  logger.warn(
    {
      executionId: task.executionId,
      nextAttempt
    },
    "Scheduling retry"
  );
  
  const result = await pool.query(
    `INSERT INTO job_executions (
        job_id,
        scheduled_at,
        status,
        attempt
     )
     SELECT job_id, scheduled_at, 'PENDING', $1
     FROM job_executions
     WHERE id = $2
     RETURNING id`,
    [nextAttempt, task.executionId]
  );

  const newExecutionId = result.rows[0].id;

  // simple backoff
  setTimeout(() => {
    executionQueue.enqueue({
      ...task,
      executionId: newExecutionId,
      attempt: nextAttempt
    });
  }, nextAttempt * 2000);
}