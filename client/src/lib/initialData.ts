import { Project, Task } from '@/types/gantt';
import { addDays } from 'date-fns';

// Project starts January 26, 2026
const PROJECT_START = new Date(2026, 0, 26); // January 26, 2026

export const AVIATION_PROJECT_DATA: Project = {
  id: 'aviation-impl-001',
  name: 'MIS Migration Project',
  startDate: PROJECT_START,
  lanes: [
    { id: 'train-ku', name: 'Formation Key Users', order: 1, color: '#22c55e' },
    { id: 'process', name: 'Processus', order: 2, color: '#f97316' },
    { id: 'ojt', name: 'OJT & Workshop', order: 3, color: '#eab308' },
    { id: 'testing', name: 'Testing', order: 4, color: '#6b7280' },
    { id: 'train-eu', name: 'Formation End Users', order: 5, color: '#ec4899' },
    { id: 'data', name: 'Data Migration', order: 6, color: '#f59e0b' },
    { id: 'it', name: 'IT & Operations', order: 7, color: '#8b5cf6' },
    { id: 'support', name: 'Post Go-Live', order: 8, color: '#0ea5e9' },
  ],
  dependencies: [],
  tasks: [
    // ============================================
    // Formation Key Users (green)
    // ============================================
    {
      id: 'train-1',
      name: 'AMOS Basic WBT',
      laneId: 'train-ku',
      start: new Date(2026, 0, 29), // 29/01/2026
      end: addDays(new Date(2026, 0, 29), 14), // 2 semaines
      duration: 14,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'completed',
      owner: 'Key User',
      tags: ['KU 100%']
    },
    {
      id: 'train-2',
      name: 'E-Learning Part 1',
      laneId: 'train-ku',
      start: new Date(2026, 1, 2), // 02/02/2026
      end: addDays(new Date(2026, 1, 2), 21), // ~3 semaines (5+5+5)
      duration: 21,
      progress: 50,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Key User',
      tags: ['KU 50%']
    },
    {
      id: 'train-3',
      name: 'Key Awareness Sessions',
      laneId: 'train-ku',
      start: new Date(2026, 1, 24), // 24/02/2026
      end: addDays(new Date(2026, 1, 24), 7), // 1 semaine
      duration: 7,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'completed',
      owner: 'Key User',
      tags: ['KU 100%']
    },
    {
      id: 'train-4',
      name: 'CAMO Part 2 Training',
      laneId: 'train-ku',
      start: new Date(2026, 2, 2), // 02/03/2026
      end: addDays(new Date(2026, 2, 2), 14), // 2 semaines (5+5)
      duration: 14,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'completed',
      owner: 'Key User',
      tags: ['KU 100%']
    },
    {
      id: 'train-5',
      name: 'Module Training Part 2',
      laneId: 'train-ku',
      start: new Date(2026, 2, 30), // 30/03/2026
      end: addDays(new Date(2026, 2, 30), 28), // 4 semaines (5+5+5+5)
      duration: 28,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'completed',
      owner: 'Key User',
      tags: ['KU 100%']
    },

    // ============================================
    // Processus (orange)
    // ============================================
    {
      id: 'process-1',
      name: 'Formalisation processus existants',
      laneId: 'process',
      start: new Date(2026, 1, 2), // 02/02/2026
      end: addDays(new Date(2026, 1, 2), 21), // 3 semaines
      duration: 21,
      progress: 25,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Key User, Business Spécialistes',
      tags: ['KU 25%', 'BS 25%']
    },

    // ============================================
    // OJT & Workshop (yellow)
    // ============================================
    {
      id: 'ojt-1',
      name: 'OJT Key Users',
      laneId: 'ojt',
      start: new Date(2026, 2, 30), // 30/03/2026
      end: addDays(new Date(2026, 2, 30), 56), // 8 semaines (démarrant à 06-avr jusqu'à fin mai)
      duration: 56,
      progress: 50,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Key User',
      tags: ['KU 50%', 'BS 25%']
    },
    {
      id: 'ojt-2',
      name: 'Workshop',
      laneId: 'ojt',
      start: new Date(2026, 5, 1), // 01/06/2026
      end: addDays(new Date(2026, 5, 1), 28), // 4 semaines
      duration: 28,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Key User',
      tags: ['KU 100%', 'BS 50%']
    },

    // ============================================
    // Testing (gray)
    // ============================================
    {
      id: 'test-1',
      name: 'AMOS Testing et configuration',
      laneId: 'testing',
      start: new Date(2026, 5, 29), // 29/06/2026
      end: addDays(new Date(2026, 5, 29), 28), // 4 semaines
      duration: 28,
      progress: 100,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Key User',
      tags: ['KU 100%', 'BS 50%']
    },
    {
      id: 'test-2',
      name: 'User Acceptance Testing',
      laneId: 'testing',
      start: new Date(2026, 6, 27), // 27/07/2026
      end: addDays(new Date(2026, 6, 27), 28), // 4 semaines
      duration: 28,
      progress: 100,
      type: 'task',
      dependencies: ['test-1'],
      status: 'planned',
      owner: 'Key User',
      tags: ['KU 100%', 'BS 50%']
    },
    {
      id: 'test-3',
      name: 'Final Testing',
      laneId: 'testing',
      start: new Date(2026, 7, 24), // 24/08/2026
      end: addDays(new Date(2026, 7, 24), 28), // 4 semaines
      duration: 28,
      progress: 100,
      type: 'task',
      dependencies: ['test-2'],
      status: 'planned',
      owner: 'Key User',
      tags: ['KU 100%', 'BS 50%']
    },

    // ============================================
    // Formation End Users (pink)
    // ============================================
    {
      id: 'train-eu-1',
      name: 'Formations End users',
      laneId: 'train-eu',
      start: new Date(2026, 5, 29), // 29/06/2026
      end: addDays(new Date(2026, 5, 29), 56), // 8 semaines
      duration: 56,
      progress: 50,
      type: 'task',
      dependencies: [],
      status: 'planned',
      owner: 'Business Spécialistes',
      tags: ['BS 50%']
    },

    // ============================================
    // Data Migration (amber)
    // ============================================
    {
      id: 'data-1',
      name: 'Data Scoping and Mapping',
      laneId: 'data',
      start: new Date(2026, 3, 1), // 01/04/2026
      end: addDays(new Date(2026, 3, 1), 30),
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
      start: new Date(2026, 3, 15), // 15/04/2026
      end: addDays(new Date(2026, 3, 15), 60),
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
      start: new Date(2026, 5, 1), // 01/06/2026
      end: addDays(new Date(2026, 5, 1), 30),
      duration: 30,
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
      start: new Date(2026, 6, 1), // 01/07/2026
      end: addDays(new Date(2026, 6, 1), 30),
      duration: 30,
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
      start: new Date(2026, 7, 1), // 01/08/2026
      end: addDays(new Date(2026, 7, 1), 30),
      duration: 30,
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
      start: new Date(2026, 8, 1), // 01/09/2026
      end: addDays(new Date(2026, 8, 1), 14),
      duration: 14,
      progress: 0,
      type: 'milestone',
      dependencies: ['data-5'],
      status: 'planned'
    },

    // ============================================
    // IT & Operations (purple)
    // ============================================
    {
      id: 'it-1',
      name: 'Hardware / Operational Setup',
      laneId: 'it',
      start: new Date(2026, 1, 1), // 01/02/2026
      end: addDays(new Date(2026, 1, 1), 60),
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
      start: new Date(2026, 2, 1), // 01/03/2026
      end: addDays(new Date(2026, 2, 1), 210), // jusqu'à fin septembre
      duration: 210,
      progress: 10,
      type: 'task',
      dependencies: [],
      status: 'in-progress',
      owner: 'Rudy NADIMIN',
      tags: ['infrastructure', 'interfaces']
    },

    // ============================================
    // Post Go-Live (sky blue)
    // ============================================
    {
      id: 'support-1',
      name: 'Go-Live Support',
      laneId: 'support',
      start: new Date(2026, 9, 1), // 01/10/2026
      end: addDays(new Date(2026, 9, 1), 90),
      duration: 90,
      progress: 0,
      type: 'task',
      dependencies: ['test-3', 'data-6'],
      status: 'planned',
      owner: 'Gaétan MAHON',
      tags: ['support', 'go-live']
    },
  ]
};
