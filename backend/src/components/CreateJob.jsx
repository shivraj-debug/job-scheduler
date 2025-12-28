import { useState } from "react";
import { api } from "../api";

export default function CreateJob({ onCreated }) {
  const [schedule, setSchedule] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.createJob(schedule, endpoint);
      setMsg("Job created successfully");
      setSchedule("");
      setEndpoint("");
      onCreated();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="bg-white shadow rounded p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Job</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="CRON Schedule (*/5 * * * *)"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          required
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="API Endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Create Job
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-gray-700">{msg}</p>}
    </div>
  );
}
