import { useEffect, useState } from "react";
import { api } from "../api";

export default function Executions({ jobId }) {
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    api.getExecutions(jobId).then(res => {
      setExecutions(res.executions || []);
    });
  }, [jobId]);

  if (executions.length === 0) {
    return (
      <p className="mt-3 text-xs text-gray-500">
        No executions yet
      </p>
    );
  }

  return (
    <div className="mt-4 border-t pt-3">
      <p className="text-sm font-semibold mb-2">
        Last Executions
      </p>

      <div className="space-y-2 text-xs">
        {executions.map((e, i) => {
          const isSuccess =
            typeof e.httpStatus === "number" &&
            e.httpStatus >= 200 &&
            e.httpStatus < 300;

          return (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded"
            >
              {/* Time */}
              <span>
                {new Date(e.executionTime).toLocaleTimeString()}
              </span>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded text-white text-[10px]
                  ${isSuccess ? "bg-green-600" : "bg-red-600"}`}
              >
                {isSuccess ? "SUCCESS" : "FAILED"}
              </span>


              {/* Duration */}
              <span>
                {e.durationMs ?? "-"} ms
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
