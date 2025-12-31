import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Script, Character, DialogueLine } from '@/types/script';
import { mockScripts, mockVoices } from '@/lib/mockData';

interface ScriptsContextType {
  scripts: Script[];
  addScript: (file: File) => Promise<Script>;
  deleteScript: (id: string) => void;
  getScript: (id: string) => Script | undefined;
  updateScript: (id: string, updates: Partial<Script>) => void;
}

const ScriptsContext = createContext<ScriptsContextType | undefined>(undefined);

// Simple script parser - extracts dialogue from text
function parseScriptText(text: string): { characters: Character[]; lines: DialogueLine[] } {
  const lines: DialogueLine[] = [];
  const characterCounts: Record<string, number> = {};
  
  // Simple pattern: CHARACTER NAME: dialogue or CHARACTER NAME\ndialogue
  const dialoguePattern = /^([A-Z][A-Z\s]+)(?::|(?:\n))\s*(.+)$/gm;
  let match;
  let order = 1;
  
  while ((match = dialoguePattern.exec(text)) !== null) {
    const characterName = match[1].trim();
    const dialogueText = match[2].trim();
    
    if (dialogueText) {
      characterCounts[characterName] = (characterCounts[characterName] || 0) + 1;
      
      lines.push({
        id: `line-${order}`,
        characterId: `char-${characterName.toLowerCase().replace(/\s+/g, '-')}`,
        characterName,
        text: dialogueText,
        type: 'dialogue',
        order,
      });
      order++;
    }
  }
  
  // If no dialogue found, create a sample structure
  if (lines.length === 0) {
    return {
      characters: [
        { id: 'char-1', name: 'CHARACTER 1', assignedTo: 'unassigned', lineCount: 0 },
        { id: 'char-2', name: 'CHARACTER 2', assignedTo: 'unassigned', lineCount: 0 },
      ],
      lines: [],
    };
  }
  
  const characters: Character[] = Object.entries(characterCounts).map(([name, count], idx) => ({
    id: `char-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    assignedTo: 'unassigned',
    lineCount: count,
  }));
  
  return { characters, lines };
}

export function ScriptsProvider({ children }: { children: ReactNode }) {
  const [scripts, setScripts] = useState<Script[]>(mockScripts);

  const addScript = useCallback(async (file: File): Promise<Script> => {
    const text = await file.text();
    const { characters, lines } = parseScriptText(text);
    
    const newScript: Script = {
      id: `script-${Date.now()}`,
      title: file.name.replace(/\.(pdf|txt|fountain)$/i, ''),
      createdAt: new Date(),
      updatedAt: new Date(),
      rawText: text,
      status: lines.length > 0 ? 'parsed' : 'uploaded',
      characters,
      lines,
    };
    
    setScripts(prev => [newScript, ...prev]);
    return newScript;
  }, []);

  const deleteScript = useCallback((id: string) => {
    setScripts(prev => prev.filter(s => s.id !== id));
  }, []);

  const getScript = useCallback((id: string) => {
    return scripts.find(s => s.id === id);
  }, [scripts]);

  const updateScript = useCallback((id: string, updates: Partial<Script>) => {
    setScripts(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    ));
  }, []);

  return (
    <ScriptsContext.Provider value={{ scripts, addScript, deleteScript, getScript, updateScript }}>
      {children}
    </ScriptsContext.Provider>
  );
}

export function useScripts() {
  const context = useContext(ScriptsContext);
  if (!context) {
    throw new Error('useScripts must be used within a ScriptsProvider');
  }
  return context;
}
