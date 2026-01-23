import { Task, Dependency, Project } from '@/types/gantt';
import { addDays, differenceInDays, isBefore, isAfter, max } from 'date-fns';

/**
 * Calculates the end date based on start date and duration
 */
export function calculateEndDate(start: Date, duration: number): Date {
  // Subtract 1 day because if a task starts on day X and lasts 1 day, it ends on day X
  // But for calculation simplicity in Gantt, we often treat end as exclusive or inclusive depending on convention.
  // Here, let's treat end as inclusive for the visual block.
  // If duration is 0 (milestone), start == end.
  if (duration === 0) return start;
  return addDays(start, duration);
}

/**
 * Recalculates the schedule based on dependencies
 * This is a simplified forward pass implementation (Critical Path Method basics)
 */
export function recalculateSchedule(project: Project): Project {
  const taskMap = new Map<string, Task>();
  const depMap = new Map<string, Dependency[]>(); // targetId -> dependencies

  // Initialize maps
  project.tasks.forEach(task => {
    taskMap.set(task.id, { ...task }); // Clone to avoid mutation of original array elements during process
  });

  project.dependencies.forEach(dep => {
    if (!depMap.has(dep.targetId)) {
      depMap.set(dep.targetId, []);
    }
    depMap.get(dep.targetId)?.push(dep);
  });

  // Topological sort or iterative pass to resolve dependencies
  // For simplicity, we'll use a multi-pass approach which is robust enough for small-medium graphs
  // A true topological sort would be better for performance on huge datasets
  
  let changed = true;
  let iterations = 0;
  const MAX_ITERATIONS = project.tasks.length * 2; // Safety break

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (const task of Array.from(taskMap.values())) {
      if (task.isLocked) continue; // Don't move locked tasks

      const incomingDeps = depMap.get(task.id) || [];
      if (incomingDeps.length === 0) continue;

      let newStart = task.start;

      for (const dep of incomingDeps) {
        const sourceTask = taskMap.get(dep.sourceId);
        if (!sourceTask) continue;

        let constraintDate: Date;

        switch (dep.type) {
          case 'FS': // Finish to Start
            constraintDate = addDays(sourceTask.end, (dep.lag || 0));
            // If task starts before constraint, push it
            if (isBefore(newStart, constraintDate)) {
              newStart = constraintDate;
            }
            break;
          case 'SS': // Start to Start
            constraintDate = addDays(sourceTask.start, (dep.lag || 0));
            if (isBefore(newStart, constraintDate)) {
              newStart = constraintDate;
            }
            break;
          case 'FF': // Finish to Finish
             // Logic is more complex for FF as it constrains the END date.
             // For simplicity in this engine, we primarily drive Start dates.
             // To support FF, we'd need to calculate max end date and derive start.
             const minEnd = addDays(sourceTask.end, (dep.lag || 0));
             const derivedStart = addDays(minEnd, -task.duration);
             if (isBefore(newStart, derivedStart)) {
                newStart = derivedStart;
             }
            break;
          case 'SF': // Start to Finish
             const minEndSF = addDays(sourceTask.start, (dep.lag || 0));
             const derivedStartSF = addDays(minEndSF, -task.duration);
             if (isBefore(newStart, derivedStartSF)) {
                newStart = derivedStartSF;
             }
            break;
        }
      }

      if (newStart.getTime() !== task.start.getTime()) {
        task.start = newStart;
        task.end = calculateEndDate(newStart, task.duration);
        changed = true;
      }
    }
  }

  return {
    ...project,
    tasks: Array.from(taskMap.values())
  };
}

/**
 * Detects circular dependencies
 * Returns true if a cycle is detected
 */
export function detectCycle(project: Project): boolean {
  // DFS based cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const adj = new Map<string, string[]>();

  project.dependencies.forEach(dep => {
    if (!adj.has(dep.sourceId)) adj.set(dep.sourceId, []);
    adj.get(dep.sourceId)?.push(dep.targetId);
  });

  function isCyclic(taskId: string): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);

    const children = adj.get(taskId) || [];
    for (const childId of children) {
      if (!visited.has(childId)) {
        if (isCyclic(childId)) return true;
      } else if (recursionStack.has(childId)) {
        return true;
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  for (const task of project.tasks) {
    if (!visited.has(task.id)) {
      if (isCyclic(task.id)) return true;
    }
  }

  return false;
}
