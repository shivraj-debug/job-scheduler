import { FastifyInstance } from "fastify";
import { pool } from "../persistence/db";
import parseExpression from "cron-parser";

export async function jobRoutes(app: FastifyInstance) {
  app.log.info("Registering job routes");

  /**
   * Create Job
   */
  app.post("/jobs", async (req, res) => {
    const { schedule, api } = req.body as {
      schedule: string;
      api: string;
    };

    if (!schedule || !api) {
      return res.status(400).send({
        error: "schedule and api are required",
      });
    }

    const interval = parseExpression.parse(schedule);
    const nextRunAt = interval.next().toDate();

    const result = await pool.query(
      `
      INSERT INTO jobs (schedule, api_endpoint, next_run_at, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING id
      `,
      [schedule, api, nextRunAt]
    );

    return { jobId: result.rows[0].id };
  });

  /**
   * Modify Job
   */
  app.put("/jobs/:jobId", async (req, res) => {
    const { jobId } = req.params as { jobId: string };
    const { schedule, api } = req.body as {
      schedule?: string;
      api?: string;
    };

    if (!schedule && !api) {
      return res.status(400).send({
        error: "At least one of schedule or api must be provided",
      });
    }

    let nextRunAt: Date | null = null;

    if (schedule) {
      try {
        const interval = parseExpression.parse(schedule);
        nextRunAt = interval.next().toDate();
      } catch {
        return res.status(400).send({
          error: "Invalid cron expression",
        });
      }
    }

    const result = await pool.query(
      `
    UPDATE jobs
    SET
      schedule = COALESCE($1, schedule),
      api_endpoint = COALESCE($2, api_endpoint),
      next_run_at = COALESCE($3, next_run_at)
    WHERE id = $4
    `,
      [schedule ?? null, api ?? null, nextRunAt, jobId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send({ error: "Job not found" });
    }

    return { jobId, updated: true };
  });

  /**
   * Get ALL Jobs (Active + Disabled)
   */
  app.get("/jobs", async (req) => {
    const { page = "1", pageSize = "20" } = req.query as {
      page?: string;
      pageSize?: string;
    };

    const pageNum = Math.max(parseInt(page, 10), 1);
    const size = Math.min(parseInt(pageSize, 10), 100);
    const offset = (pageNum - 1) * size;

    const { rows } = await pool.query(
      `
      SELECT
        id,
        schedule,
        api_endpoint,
        next_run_at,
        is_active
      FROM jobs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [size, offset]
    );

    return {
      page: pageNum,
      pageSize: size,
      jobs: rows.map((job) => ({
        jobId: job.id,
        schedule: job.schedule,
        api: job.api_endpoint,
        nextRunAt: job.next_run_at,
        is_active: job.is_active,
      })),
    };
  });

  /**
   * Enable / Disable Job
   */
  app.patch("/jobs/:jobId/status", async (req, res) => {
    const { jobId } = req.params as { jobId: string };
    const { enabled } = req.body as { enabled: boolean };

    if (typeof enabled !== "boolean") {
      return res.status(400).send({
        error: "enabled must be a boolean",
      });
    }

    const result = await pool.query(
      `
      UPDATE jobs
      SET is_active = $1,
          updated_at = now()
      WHERE id = $2
      `,
      [enabled, jobId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send({ error: "Job not found" });
    }

    return { jobId, enabled };
  });
}
