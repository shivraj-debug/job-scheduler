import { useState } from "react";
import CreateJob from "./components/CreateJob";
import JobList from "./components/JobList";
import Health from "./components/Health";
import Metrics from "./components/Metrics";

function App() {
  const [reload, setReload] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Job Scheduler Dashboard
        </h1>

        <Health />
        <Metrics />
        <CreateJob onCreated={() => setReload(r => r + 1)} />
        <JobList reload={reload} />
      </div>
    </div>
  );
}

export default App;
