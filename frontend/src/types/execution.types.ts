export interface ExecutionTask {
  executionId: string;
  jobId: string;
  apiEndpoint: string;
  scheduledAt: Date;
  attempt: number;
}