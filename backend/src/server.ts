import Fastify from "fastify";
import { jobRoutes } from "./api/jobs.routes";
import { startScheduler } from "./scheduler/scheduler";
import { startWorkerPool } from "./executor/worker.pool";
import { executionRoutes } from "./api/executions.routes";
import { metricsRoutes } from "./api/metrics.routes";
import cors from "@fastify/cors";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    base: {
      service: "job-scheduler"
    }
  }
});

app.register(cors, {
  origin: true, 
  methods: ["GET", "POST", "PUT", "PATCH"],
});

app.register(jobRoutes);
app.register(executionRoutes)
app.register(metricsRoutes)

app.get("/health", async () => ({ status: "ok" }));

app.addHook("onReady", async () => {
  startWorkerPool();
  startScheduler();
});

// app.addHook("onClose", async () => {
//   stopScheduler();
//   stopWorkerPool();
// });

app.listen({ port: 3000, host: "0.0.0.0" })
  .then(() => console.log("Server running on port 3000"))
  .catch(err => {
    app.log.error(err);
    process.exit(1);
  });
