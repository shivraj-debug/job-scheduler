const API_BASE = "http://localhost:3000";

async function handle(res) {
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "API Error");
  }
  return res.json();
}

export const api = {
  health: () =>
    fetch(`${API_BASE}/health`).then(handle),

  getJobs: (page = 1, pageSize = 20) =>
    fetch(`${API_BASE}/jobs?page=${page}&pageSize=${pageSize}`).then(handle),

  createJob: (schedule, apiEndpoint) =>
    fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule, api: apiEndpoint }),
    }).then(handle),

  updateJob: (jobId, data) =>
    fetch(`${API_BASE}/jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),

  toggleJob: (jobId, enabled) =>
    fetch(`${API_BASE}/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    }).then(handle),

  getExecutions: (jobId) =>
    fetch(`${API_BASE}/jobs/${jobId}/executions`).then(handle),

  getMetrics: () =>
    fetch(`${API_BASE}/metrics`).then(handle),
};
