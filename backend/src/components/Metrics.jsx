import { useEffect, useState } from "react";
import { api } from "../api";

export default function Metrics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getMetrics().then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">System Metrics</h2>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <b>Scheduler Drift</b>
          <p>Avg: {data.scheduler.avgDriftMs} ms</p>
          <p>P95: {data.scheduler.p95DriftMs} ms</p>
        </div>

        <div>
          <b>Execution Latency</b>
          <p>Avg: {data.execution.avgLatencyMs} ms</p>
          <p>P95: {data.execution.p95LatencyMs} ms</p>
        </div>

        <div>
          <b>Executions</b>
          <p>Total: {data.counts.total}</p>
          <p>Retries: {data.counts.retries}</p>
        </div>
      </div>
    </div>
  );
}
