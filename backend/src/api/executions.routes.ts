
import { FastifyInstance } from "fastify";
import { pool } from "../persistence/db";

export async function executionRoutes(app: FastifyInstance) {
  app.log.info("Execution Routes Registered");
  
  app.get("/jobs/:jobId/executions", async (req) => {
    app.log.info("Get Executions route called");
    
    const { jobId } = req.params as { jobId: string };

    const { rows } = await pool.query(
      `
      SELECT
        started_at,
        http_status,
        duration_ms
      FROM job_executions
      WHERE job_id = $1
        AND started_at IS NOT NULL
      ORDER BY started_at DESC
      LIMIT 5
      `,
      [jobId]
    );

    return {
      jobId,
      executions: rows.map(row => ({
        executionTime: row.started_at,
        httpStatus: row.http_status,
        durationMs: row.duration_ms
      }))
    };
  });
}