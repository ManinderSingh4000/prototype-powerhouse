export interface Character {
  id: string;
  name: string;
  assignedTo: 'user' | 'ai' | 'unassigned';
  lineCount: number;
  voiceId?: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  type: 'dialogue' | 'action' | 'heading' | 'parenthetical';
  order: number;
}

export interface Script {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  rawText: string;
  characters: Character[];
  lines: DialogueLine[];
  status: 'uploaded' | 'parsed' | 'assigned' | 'ready';
}

export interface AIVoice {
  id: string;
  name: string;
  accent: string;
  gender: 'male' | 'female' | 'neutral';
  preview?: string;
  category: string;
}

export interface RehearsalSession {
  id: string;
  scriptId: string;
  status: 'idle' | 'countdown' | 'playing' | 'paused' | 'completed';
  currentLineIndex: number;
  startedAt?: Date;
  completedAt?: Date;
}
