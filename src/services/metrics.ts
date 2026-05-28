import { supabase } from '../lib/supabaseClient';

export interface AgentPerformanceMetric {
  agent_id: string;
  task_type: string;
  execution_time_ms: number;
  success: boolean;
  quality_score?: number;
}

/**
 * Persists micro-performance metrics to the Supabase model_performance table.
 */
export async function recordPerformanceMetric(metric: AgentPerformanceMetric): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.warn("No authenticated user, skipping performance metric recording");
      return;
    }

    const { error } = await supabase
      .from('model_performance')
      .insert([
        {
          user_id: userData.user.id,
          model_name: `${metric.agent_id}::${metric.task_type}`,
          latency_ms: metric.execution_time_ms,
          quality_score: metric.quality_score ?? (metric.success ? 1.0 : 0.0),
        }
      ]);
      
    if (error) {
      console.warn("Failed to record performance metric:", error.message);
    }
  } catch (err) {
    console.error("Error in recordPerformanceMetric:", err);
  }
}

/**
 * A utility to wrap an async task and automatically capture its performance metric.
 */
export async function withPerformanceTracking<T>(
  agentId: string,
  taskType: string,
  taskFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  let success = false;

  try {
    const result = await taskFn();
    success = true;
    return result;
  } catch (err) {
    success = false;
    throw err;
  } finally {
    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);

    // Run this in the background without awaiting to avoid blocking the main thread
    recordPerformanceMetric({
      agent_id: agentId,
      task_type: taskType,
      execution_time_ms: executionTimeMs,
      success
    });
  }
}
