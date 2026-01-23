/**
 * Microsoft Project XML Parser
 * 
 * Parses MS Project XML files exported from Microsoft Project.
 * Also supports a simplified JSON format for direct import.
 */

import { Project, Task, Lane, Dependency, DependencyType } from '@/types/gantt';
import { nanoid } from 'nanoid';
import { differenceInDays, parseISO, addDays } from 'date-fns';

/**
 * Parse MS Project XML format
 */
export function parseMSProjectXML(xmlString: string): Project | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('XML Parse Error:', parseError.textContent);
      return null;
    }

    const projectEl = xmlDoc.querySelector('Project');
    if (!projectEl) {
      console.error('No Project element found in XML');
      return null;
    }

    // Parse project info
    const projectName = getTextContent(projectEl, 'Name') || 'Imported Project';
    const projectStart = parseDate(getTextContent(projectEl, 'StartDate')) || new Date();

    // Parse tasks
    const taskElements = projectEl.querySelectorAll('Tasks > Task');
    const tasks: Task[] = [];
    const taskIdMap = new Map<string, string>(); // MS Project UID -> our task ID
    const laneSet = new Set<string>();
    
    taskElements.forEach((taskEl) => {
      const uid = getTextContent(taskEl, 'UID');
      const name = getTextContent(taskEl, 'Name');
      const outlineLevel = parseInt(getTextContent(taskEl, 'OutlineLevel') || '0');
      
      // Skip summary tasks (outline level 0 or 1) and empty names
      if (!name || outlineLevel === 0) return;
      
      const startStr = getTextContent(taskEl, 'Start');
      const finishStr = getTextContent(taskEl, 'Finish');
      const durationStr = getTextContent(taskEl, 'Duration');
      const percentComplete = parseInt(getTextContent(taskEl, 'PercentComplete') || '0');
      const milestone = getTextContent(taskEl, 'Milestone') === '1';
      
      const start = parseDate(startStr) || new Date();
      const end = parseDate(finishStr) || addDays(start, 1);
      const duration = durationStr ? parseDuration(durationStr) : differenceInDays(end, start);
      
      // Determine lane based on outline level or WBS
      const wbs = getTextContent(taskEl, 'WBS') || '';
      const laneId = determineLane(wbs, outlineLevel);
      laneSet.add(laneId);
      
      // Parse predecessors
      const predecessorLinks = taskEl.querySelectorAll('PredecessorLink');
      const dependencies: string[] = [];
      
      predecessorLinks.forEach((predEl) => {
        const predUid = getTextContent(predEl, 'PredecessorUID');
        if (predUid && taskIdMap.has(predUid)) {
          dependencies.push(taskIdMap.get(predUid)!);
        }
      });
      
      const taskId = `task-${nanoid(8)}`;
      if (uid) {
        taskIdMap.set(uid, taskId);
      }
      
      // Map status
      let status: Task['status'] = 'planned';
      if (percentComplete >= 100) {
        status = 'completed';
      } else if (percentComplete > 0) {
        status = 'in-progress';
      }
      
      tasks.push({
        id: taskId,
        name,
        laneId,
        start,
        end,
        duration,
        progress: percentComplete,
        type: milestone ? 'milestone' : 'task',
        dependencies,
        status,
      });
    });
    
    // Create lanes from collected lane IDs
    const lanes = createLanesFromSet(laneSet);
    
    // Create dependency objects
    const dependencies: Dependency[] = [];
    tasks.forEach((task) => {
      task.dependencies.forEach((predId) => {
        dependencies.push({
          id: `dep-${nanoid(8)}`,
          sourceId: predId,
          targetId: task.id,
          type: 'FS', // Default to Finish-to-Start
          lag: 0,
        });
      });
    });

    return {
      id: `proj-${nanoid(8)}`,
      name: projectName,
      startDate: projectStart,
      lanes,
      tasks,
      dependencies,
    };
  } catch (error) {
    console.error('Error parsing MS Project XML:', error);
    return null;
  }
}

/**
 * Parse a simplified JSON format for quick import
 */
export interface SimplifiedTask {
  name: string;
  start: string; // ISO date string
  end: string; // ISO date string
  progress?: number;
  type?: 'task' | 'milestone';
  lane?: string;
  owner?: string;
  dependencies?: string[]; // Task names
}

export interface SimplifiedProject {
  name: string;
  tasks: SimplifiedTask[];
}

export function parseSimplifiedJSON(json: SimplifiedProject): Project | null {
  try {
    const taskNameToId = new Map<string, string>();
    const laneSet = new Set<string>();
    
    // First pass: create task IDs and collect lanes
    const tasks: Task[] = json.tasks.map((t, index) => {
      const taskId = `task-${nanoid(8)}`;
      taskNameToId.set(t.name, taskId);
      
      const laneId = t.lane || 'default';
      laneSet.add(laneId);
      
      const start = parseISO(t.start);
      const end = parseISO(t.end);
      const duration = differenceInDays(end, start);
      
      let status: Task['status'] = 'planned';
      if (t.progress && t.progress >= 100) {
        status = 'completed';
      } else if (t.progress && t.progress > 0) {
        status = 'in-progress';
      }
      
      return {
        id: taskId,
        name: t.name,
        laneId,
        start,
        end,
        duration,
        progress: t.progress || 0,
        type: t.type || 'task',
        dependencies: [], // Will be filled in second pass
        status,
        owner: t.owner,
      };
    });
    
    // Second pass: resolve dependencies by name
    const dependencies: Dependency[] = [];
    json.tasks.forEach((t, index) => {
      if (t.dependencies) {
        t.dependencies.forEach((depName) => {
          const sourceId = taskNameToId.get(depName);
          if (sourceId) {
            const targetId = tasks[index].id;
            tasks[index].dependencies.push(sourceId);
            dependencies.push({
              id: `dep-${nanoid(8)}`,
              sourceId,
              targetId,
              type: 'FS',
              lag: 0,
            });
          }
        });
      }
    });
    
    const lanes = createLanesFromSet(laneSet);
    
    return {
      id: `proj-${nanoid(8)}`,
      name: json.name,
      startDate: tasks.length > 0 ? tasks[0].start : new Date(),
      lanes,
      tasks,
      dependencies,
    };
  } catch (error) {
    console.error('Error parsing simplified JSON:', error);
    return null;
  }
}

/**
 * Auto-detect file format and parse accordingly
 */
export async function parseProjectFile(file: File): Promise<Project | null> {
  const text = await file.text();
  
  // Detect format based on content
  const trimmed = text.trim();
  
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<Project')) {
    return parseMSProjectXML(text);
  }
  
  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(text);
      if (json.tasks && Array.isArray(json.tasks)) {
        return parseSimplifiedJSON(json);
      }
    } catch {
      console.error('Invalid JSON file');
    }
  }
  
  console.error('Unsupported file format');
  return null;
}

// Helper functions

function getTextContent(parent: Element, tagName: string): string | null {
  const el = parent.querySelector(tagName);
  return el?.textContent || null;
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    // MS Project uses ISO format
    return parseISO(dateStr);
  } catch {
    return null;
  }
}

function parseDuration(durationStr: string): number {
  // MS Project duration format: PT8H0M0S (8 hours) or P1D (1 day)
  const dayMatch = durationStr.match(/P(\d+)D/);
  if (dayMatch) {
    return parseInt(dayMatch[1]);
  }
  
  const hourMatch = durationStr.match(/PT(\d+)H/);
  if (hourMatch) {
    return Math.ceil(parseInt(hourMatch[1]) / 8); // Assume 8-hour days
  }
  
  return 1; // Default to 1 day
}

function determineLane(wbs: string, outlineLevel: number): string {
  // Use first WBS segment or outline level to determine lane
  const wbsParts = wbs.split('.');
  if (wbsParts.length > 1) {
    const firstSegment = parseInt(wbsParts[0]);
    if (!isNaN(firstSegment)) {
      return `lane-${firstSegment}`;
    }
  }
  
  // Fallback based on outline level
  return `lane-${Math.min(outlineLevel, 5)}`;
}

const LANE_COLORS = [
  '#0ea5e9', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#06b6d4', // cyan
];

const LANE_NAMES: Record<string, string> = {
  'lane-1': 'Phase 1',
  'lane-2': 'Phase 2',
  'lane-3': 'Phase 3',
  'lane-4': 'Phase 4',
  'lane-5': 'Phase 5',
  'default': 'Tasks',
};

function createLanesFromSet(laneSet: Set<string>): Lane[] {
  const lanes: Lane[] = [];
  const sortedLanes = Array.from(laneSet).sort();
  
  sortedLanes.forEach((laneId, index) => {
    lanes.push({
      id: laneId,
      name: LANE_NAMES[laneId] || laneId.replace('lane-', 'Phase '),
      order: index + 1,
      color: LANE_COLORS[index % LANE_COLORS.length],
    });
  });
  
  return lanes;
}

/**
 * Create a sample project JSON for testing/documentation
 */
export function getSampleProjectJSON(): SimplifiedProject {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    name: 'Sample Project',
    tasks: [
      {
        name: 'Project Kickoff',
        start: formatDate(today),
        end: formatDate(addDays(today, 7)),
        progress: 100,
        lane: 'Planning',
        owner: 'Project Manager',
      },
      {
        name: 'Requirements Analysis',
        start: formatDate(addDays(today, 7)),
        end: formatDate(addDays(today, 21)),
        progress: 50,
        lane: 'Planning',
        dependencies: ['Project Kickoff'],
      },
      {
        name: 'Development Phase 1',
        start: formatDate(addDays(today, 21)),
        end: formatDate(addDays(today, 51)),
        progress: 0,
        lane: 'Development',
        dependencies: ['Requirements Analysis'],
      },
      {
        name: 'Testing',
        start: formatDate(addDays(today, 51)),
        end: formatDate(addDays(today, 66)),
        progress: 0,
        lane: 'QA',
        dependencies: ['Development Phase 1'],
      },
      {
        name: 'Go-Live',
        start: formatDate(addDays(today, 66)),
        end: formatDate(addDays(today, 66)),
        type: 'milestone',
        lane: 'Deployment',
        dependencies: ['Testing'],
      },
    ],
  };
}
