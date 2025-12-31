import { Script, AIVoice, Character, DialogueLine } from '@/types/script';

export const mockVoices: AIVoice[] = [
  { id: 'v1', name: 'James', accent: 'British RP', gender: 'male', category: 'Classic' },
  { id: 'v2', name: 'Emily', accent: 'American Standard', gender: 'female', category: 'Classic' },
  { id: 'v3', name: 'Marcus', accent: 'New York', gender: 'male', category: 'Regional' },
  { id: 'v4', name: 'Sofia', accent: 'Spanish', gender: 'female', category: 'International' },
  { id: 'v5', name: 'Oliver', accent: 'Australian', gender: 'male', category: 'International' },
  { id: 'v6', name: 'Aria', accent: 'Italian', gender: 'female', category: 'International' },
  { id: 'v7', name: 'Liam', accent: 'Irish', gender: 'male', category: 'Regional' },
  { id: 'v8', name: 'Emma', accent: 'Southern American', gender: 'female', category: 'Regional' },
];

export const sampleScript: Script = {
  id: 'sample-1',
  title: 'The Audition',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  rawText: '',
  status: 'ready',
  characters: [
    { id: 'c1', name: 'ALEX', assignedTo: 'user', lineCount: 5 },
    { id: 'c2', name: 'JORDAN', assignedTo: 'ai', lineCount: 5, voiceId: 'v1' },
  ],
  lines: [
    { id: 'l1', characterId: 'c2', characterName: 'JORDAN', text: "You're late. Again.", type: 'dialogue', order: 1 },
    { id: 'l2', characterId: 'c1', characterName: 'ALEX', text: "I know. I'm sorry. The subway—", type: 'dialogue', order: 2 },
    { id: 'l3', characterId: 'c2', characterName: 'JORDAN', text: "Save it. Do you even want this job?", type: 'dialogue', order: 3 },
    { id: 'l4', characterId: 'c1', characterName: 'ALEX', text: "More than anything. Please, just give me one more chance.", type: 'dialogue', order: 4 },
    { id: 'l5', characterId: 'c2', characterName: 'JORDAN', text: "(sighing) Fine. But this is the last time.", type: 'dialogue', order: 5 },
    { id: 'l6', characterId: 'c1', characterName: 'ALEX', text: "Thank you. You won't regret it.", type: 'dialogue', order: 6 },
    { id: 'l7', characterId: 'c2', characterName: 'JORDAN', text: "Show me. Prove it. Right now.", type: 'dialogue', order: 7 },
    { id: 'l8', characterId: 'c1', characterName: 'ALEX', text: "(determined) Watch me.", type: 'dialogue', order: 8 },
  ],
};

export const mockScripts: Script[] = [
  sampleScript,
  {
    id: 'sample-2',
    title: 'Coffee Shop Scene',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    rawText: '',
    status: 'assigned',
    characters: [
      { id: 'c3', name: 'SARAH', assignedTo: 'user', lineCount: 8 },
      { id: 'c4', name: 'MIKE', assignedTo: 'ai', lineCount: 7, voiceId: 'v3' },
    ],
    lines: [],
  },
  {
    id: 'sample-3',
    title: 'Monologue - Hamlet',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    rawText: '',
    status: 'parsed',
    characters: [
      { id: 'c5', name: 'HAMLET', assignedTo: 'unassigned', lineCount: 1 },
    ],
    lines: [],
  },
];
