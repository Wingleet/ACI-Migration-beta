import { Project, Task } from '@/types/gantt';
import { addMonths, startOfMonth, addDays } from 'date-fns';

const PROJECT_START = startOfMonth(new Date()); // M01 starts now

function getMonthDate(monthIndex: number): Date {
  // monthIndex is 1-based (M01 = 0 months added)
  return addMonths(PROJECT_START, monthIndex - 1);
}

export const AVIATION_PROJECT_DATA: Project = {
  id: 'aviation-impl-001',
  name: 'Aviation MRO Implementation Project',
  startDate: PROJECT_START,
  lanes: [
    { id: 'impl', name: 'Implementation', order: 1, color: '#0ea5e9' },
    { id: 'train', name: 'Training', order: 2, color: '#10b981' },
    { id: 'data', name: 'Data Migration', order: 3, color: '#f59e0b' },
    { id: 'it', name: 'IT & Operations', order: 4, color: '#8b5cf6' },
    { id: 'support', name: 'Post Go-Live', order: 5, color: '#ec4899' },
  ],
  dependencies: [],
  tasks: [
    // 1. Implementation
    {
      id: 'impl-1',
      name: 'Project Planning',
      laneId: 'impl',
      start: getMonthDate(1),
      end: addDays(getMonthDate(2), -1),
      duration: 30,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'completed',
      owner: 'Marie Dupont',
      tags: ['planning', 'kickoff']
    },
    {
      id: 'impl-2',
      name: 'Kick-off & Scoping',
      laneId: 'impl',
      start: getMonthDate(1),
      end: addDays(getMonthDate(3), -1),
      duration: 60,
      progress: 80,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Jean Martin',
      tags: ['scoping']
    },
    {
      id: 'impl-3',
      name: 'OJT (On-Job Training)',
      laneId: 'impl',
      start: getMonthDate(5),
      end: addDays(getMonthDate(6), -1),
      duration: 30,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Sophie Bernard'
    },
    {
      id: 'impl-4',
      name: 'Workshop',
      laneId: 'impl',
      start: getMonthDate(6),
      end: addDays(getMonthDate(7), -1),
      duration: 30,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Pierre Leroy'
    },
    {
      id: 'impl-5',
      name: 'AMOS Testing & Configuration',
      laneId: 'impl',
      start: getMonthDate(7),
      end: addDays(getMonthDate(9), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Marie Dupont',
      tags: ['AMOS', 'testing']
    },
    {
      id: 'impl-6',
      name: 'User Acceptance Testing (UAT)',
      laneId: 'impl',
      start: getMonthDate(8),
      end: addDays(getMonthDate(10), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: ['impl-5'],
      status: 'planned',
      owner: 'Jean Martin',
      tags: ['UAT', 'testing']
    },
    {
      id: 'impl-7',
      name: 'Final Acceptance',
      laneId: 'impl',
      start: getMonthDate(9),
      end: addDays(getMonthDate(11), -1),
      duration: 60,
      progress: 0,
      type: 'milestone',
      dependencies: ['impl-6'],
      status: 'planned',
      isScopeFreeze: true
    },

    // 2. Training
    {
      id: 'train-1',
      name: 'AMOS Basic WBT & E-Learning',
      laneId: 'train',
      start: getMonthDate(1),
      end: addDays(getMonthDate(3), -1),
      duration: 60,
      progress: 50,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Sophie Bernard',
      tags: ['e-learning', 'AMOS']
    },
    {
      id: 'train-2',
      name: 'Key Awareness Session (KUAS)',
      laneId: 'train',
      start: getMonthDate(2),
      end: addDays(getMonthDate(2), 5),
      duration: 5,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Pierre Leroy'
    },
    {
      id: 'train-3',
      name: 'CAMO Part 2 Training',
      laneId: 'train',
      start: getMonthDate(2),
      end: addDays(getMonthDate(4), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Sophie Bernard',
      tags: ['CAMO']
    },
    {
      id: 'train-4',
      name: 'Module Training - Part 2 (VILT)',
      laneId: 'train',
      start: getMonthDate(3),
      end: addDays(getMonthDate(7), -1),
      duration: 120,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Marie Dupont',
      tags: ['VILT', 'training']
    },
    {
      id: 'train-5',
      name: 'End User Training (EUT)',
      laneId: 'train',
      start: getMonthDate(7),
      end: addDays(getMonthDate(9), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: ['train-4'],
      status: 'planned',
      owner: 'Jean Martin',
      tags: ['EUT']
    },

    // 3. Data Migration
    {
      id: 'data-1',
      name: 'Data Scoping and Mapping',
      laneId: 'data',
      start: getMonthDate(4),
      end: addDays(getMonthDate(5), -1),
      duration: 30,
      progress: 0,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Pierre Leroy',
      tags: ['data', 'mapping']
    },
    {
      id: 'data-2',
      name: 'X-file Preparation',
      laneId: 'data',
      start: getMonthDate(4),
      end: addDays(getMonthDate(6), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: ['data-1'],
      status: 'planned',
      owner: 'Sophie Bernard'
    },
    {
      id: 'data-3',
      name: 'Data Cycle 1',
      laneId: 'data',
      start: getMonthDate(6),
      end: addDays(getMonthDate(8), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: ['data-2'],
      status: 'planned',
      owner: 'Pierre Leroy',
      tags: ['migration']
    },
    {
      id: 'data-4',
      name: 'Data Cycle 2',
      laneId: 'data',
      start: getMonthDate(7),
      end: addDays(getMonthDate(9), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: ['data-3'],
      status: 'planned',
      owner: 'Pierre Leroy',
      tags: ['migration']
    },
    {
      id: 'data-5',
      name: 'Data Cycle 3',
      laneId: 'data',
      start: getMonthDate(8),
      end: addDays(getMonthDate(10), -1),
      duration: 60,
      progress: 0,
      type: 'task',
      dependencies: ['data-4'],
      status: 'planned',
      owner: 'Sophie Bernard',
      tags: ['migration']
    },
    {
      id: 'data-6',
      name: 'Go-Live Rehearsal',
      laneId: 'data',
      start: getMonthDate(9),
      end: addDays(getMonthDate(10), -1),
      duration: 30,
      progress: 0,
      type: 'milestone',
      dependencies: ['data-5'],
      status: 'planned'
    },

    // 4. IT & Operations
    {
      id: 'it-1',
      name: 'Hardware / Operational Setup',
      laneId: 'it',
      start: getMonthDate(2),
      end: addDays(getMonthDate(4), -1),
      duration: 60,
      progress: 20,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Jean Martin',
      tags: ['infrastructure']
    },
    {
      id: 'it-2',
      name: 'IT Infrastructure & Interfaces',
      laneId: 'it',
      start: getMonthDate(3),
      end: addDays(getMonthDate(13), -1),
      duration: 300,
      progress: 10,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Pierre Leroy',
      tags: ['infrastructure', 'interfaces']
    },

    // 5. Post-Go-Live Support
    {
      id: 'support-1',
      name: 'Go-Live Support',
      laneId: 'support',
      start: getMonthDate(10),
      end: addDays(getMonthDate(13), -1),
      duration: 90,
      progress: 0,
      type: 'task',
      dependencies: ['impl-7'],
      status: 'planned',
      owner: 'Marie Dupont',
      tags: ['support', 'go-live']
    }
  ]
};
