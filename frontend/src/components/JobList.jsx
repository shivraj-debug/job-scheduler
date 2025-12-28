import { useEffect, useState } from "react";
import { api } from "../api";
import Executions from "./Executions";

export default function JobList({ reload }) {
  const [jobs, setJobs] = useState([]);
  const [loadingJobId, setLoadingJobId] = useState(null);

  const [editingJobId, setEditingJobId] = useState(null);
  const [editSchedule, setEditSchedule] = useState("");
  const [editApi, setEditApi] = useState("");

  // Load jobs (ONLY active jobs)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getJobs();
        setJobs(res.jobs || []);
      } catch (e) {
        console.error("Failed to load jobs", e);
      }
    };
    load();
  }, [reload]);

  // Disable job
  const disableJob = async (jobId) => {
    setLoadingJobId(jobId);
    try {
      await api.toggleJob(jobId, false);
      const res = await api.getJobs();
      setJobs(res.jobs || []);
    } catch (e) {
      console.error("Disable failed", e);
      alert("Disable failed. Check backend.");
    } finally {
      setLoadingJobId(null); 
    }
  };

  // Start editing
  const startEdit = (job) => {
    setEditingJobId(job.jobId);
    setEditSchedule(job.schedule);
    setEditApi(job.api);
  };

  // Save edit
  const saveEdit = async (jobId) => {
    setLoadingJobId(jobId);
    try {
      await api.updateJob(jobId, {
        schedule: editSchedule,
        api: editApi,
      });

      // refetch active jobs
      const res = await api.getJobs();
      setJobs(res.jobs || []);
      setEditingJobId(null);
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed. Check backend.");
    } finally {
      setLoadingJobId(null); 
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Jobs</h2>

      {jobs.map(job => (
        <div key={job.jobId} className="bg-white shadow rounded p-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-sm">{job.schedule}</p>
              <p className="text-sm text-gray-600">{job.api}</p>
              <p className="text-xs text-gray-500">
                Next run: {new Date(job.nextRunAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => startEdit(job)}
                disabled={loadingJobId === job.jobId}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm disabled:opacity-50"
              >
                Edit
              </button>

              <button
                onClick={() => disableJob(job.jobId)}
                disabled={loadingJobId === job.jobId}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50"
              >
                {loadingJobId === job.jobId ? "Disabling..." : "Disable"}
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {editingJobId === job.jobId && (
            <div className="mt-4 bg-gray-50 p-3 rounded">
              <input
                className="w-full border px-2 py-1 rounded mb-2"
                value={editSchedule}
                onChange={(e) => setEditSchedule(e.target.value)}
              />

              <input
                className="w-full border px-2 py-1 rounded mb-2"
                value={editApi}
                onChange={(e) => setEditApi(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(job.jobId)}
                  disabled={loadingJobId === job.jobId}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {loadingJobId === job.jobId ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => setEditingJobId(null)}
                  className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <Executions jobId={job.jobId} />
        </div>
      ))}
    </div>
  );
}
