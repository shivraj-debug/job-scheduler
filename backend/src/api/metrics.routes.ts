import { FastifyInstance } from "fastify";
import { pool } from "../persistence/db";

export async function metricsRoutes(app: FastifyInstance) {
  
  app.log.info("Registering metrics route")
  app.get("/metrics", async () => {

    app.log.info("Get Metrics route called");

    // -------- Scheduler Drift --------
    const drift = await pool.query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM (started_at - scheduled_at)) * 1000) AS avg_drift,
        MAX(EXTRACT(EPOCH FROM (started_at - scheduled_at)) * 1000) AS max_drift,
        PERCENTILE_CONT(0.95)
          WITHIN GROUP (
            ORDER BY EXTRACT(EPOCH FROM (started_at - scheduled_at)) * 1000
          ) AS p95_drift
      FROM job_executions
      WHERE started_at IS NOT NULL
    `);

    // -------- Execution Latency --------
    const latency = await pool.query(`
      SELECT
        AVG(duration_ms) AS avg_latency,
        MAX(duration_ms) AS max_latency,
        PERCENTILE_CONT(0.95)
          WITHIN GROUP (ORDER BY duration_ms) AS p95_latency
      FROM job_executions
      WHERE duration_ms IS NOT NULL
    `);

    // -------- Execution Counts --------
    const counts = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'SUCCESS') AS success,
        COUNT(*) FILTER (WHERE status = 'FAILED') AS failed,
        COUNT(*) FILTER (WHERE attempt > 1) AS retries
      FROM job_executions
    `);

    return {
      scheduler: {
        avgDriftMs: Number(drift.rows[0].avg_drift) || 0,
        p95DriftMs: Number(drift.rows[0].p95_drift) || 0,
        maxDriftMs: Number(drift.rows[0].max_drift) || 0
      },
      execution: {
        avgLatencyMs: Number(latency.rows[0].avg_latency) || 0,
        p95LatencyMs: Number(latency.rows[0].p95_latency) || 0,
        maxLatencyMs: Number(latency.rows[0].max_latency) || 0
      },
      counts: {
        total: Number(counts.rows[0].total),
        success: Number(counts.rows[0].success),
        failed: Number(counts.rows[0].failed),
        retries: Number(counts.rows[0].retries)
      }
    };
  });
}