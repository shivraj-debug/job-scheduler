import { ExecutionTask } from '../types/execution.types';

export class ExecutionQueue {
  private queue: ExecutionTask[] = [];
  private resolvers: ((task: ExecutionTask) => void)[] = [];

  enqueue(task: ExecutionTask) {
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift();
      resolve!(task);
    } else {
      this.queue.push(task);
    }
  }

  async dequeue(): Promise<ExecutionTask> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    return new Promise(resolve => {
      this.resolvers.push(resolve);
    });
  }

  size(): number {
    return this.queue.length;
  }
}

export const executionQueue = new ExecutionQueue();

