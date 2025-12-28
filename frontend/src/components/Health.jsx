import { useEffect, useState } from "react";
import { api } from "../api";

export default function Health() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    api.health()
      .then(() => setStatus("Backend Healthy"))
      .catch(() => setStatus("Backend Down"));
  }, []);

  return (
    <div className="mb-4 text-sm text-gray-600">
      Status: {status}
    </div>
  );
}
