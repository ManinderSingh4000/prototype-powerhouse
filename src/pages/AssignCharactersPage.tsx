import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockVoices } from '@/lib/mockData';
import { User, Bot, Volume2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Character, AIVoice } from '@/types/script';
import { useScripts } from '@/context/ScriptsContext';

export default function AssignCharactersPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getScript, updateScript } = useScripts();
  const script = getScript(id || '');
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectingForCharacter, setSelectingForCharacter] = useState<string | null>(null);

  useEffect(() => {
    if (script) {
      setCharacters(script.characters);
    }
  }, [script]);

  if (!script) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Script not found</h1>
          <Link to="/scripts">
            <Button variant="hero">Back to Scripts</Button>
          </Link>
        </div>
      </div>
    );
  }

  const toggleAssignment = (characterId: string) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === characterId) {
        const newAssignment = char.assignedTo === 'user' ? 'ai' : 
                              char.assignedTo === 'ai' ? 'unassigned' : 'user';
        return { ...char, assignedTo: newAssignment };
      }
      return char;
    }));
  };

  const openVoiceSelector = (characterId: string) => {
    setSelectingForCharacter(characterId);
  };

  const selectVoice = (voiceId: string) => {
    if (selectingForCharacter) {
      setCharacters(prev => prev.map(char => {
        if (char.id === selectingForCharacter) {
          return { ...char, voiceId };
        }
        return char;
      }));
      setSelectingForCharacter(null);
    }
  };

  const getVoiceById = (voiceId?: string): AIVoice | undefined => {
    return mockVoices.find(v => v.id === voiceId);
  };

  const canProceed = characters.some(c => c.assignedTo === 'user') && 
                     characters.some(c => c.assignedTo === 'ai' && c.voiceId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link to="/scripts" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Scripts
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="font-serif text-4xl font-bold mb-2">{script.title}</h1>
              <p className="text-muted-foreground text-lg">
                Assign characters to yourself or the AI scene partner
              </p>
            </div>

            {/* Characters Grid */}
            <div className="grid gap-4 mb-8">
              {characters.map((character) => (
                <Card key={character.id} className={`border-2 transition-all duration-300 ${
                  character.assignedTo === 'user' ? 'border-primary bg-primary/5' :
                  character.assignedTo === 'ai' ? 'border-accent bg-accent/5' :
                  'border-border'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          character.assignedTo === 'user' ? 'bg-primary text-primary-foreground' :
                          character.assignedTo === 'ai' ? 'bg-accent text-accent-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {character.assignedTo === 'user' ? <User className="w-6 h-6" /> :
                           character.assignedTo === 'ai' ? <Bot className="w-6 h-6" /> :
                           <span className="text-xl font-bold">{character.name[0]}</span>}
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{character.name}</h3>
                          <p className="text-sm text-muted-foreground">{character.lineCount} lines</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {character.assignedTo === 'ai' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openVoiceSelector(character.id)}
                            className="min-w-[140px]"
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            {character.voiceId ? getVoiceById(character.voiceId)?.name : 'Select Voice'}
                          </Button>
                        )}
                        <Button
                          variant={character.assignedTo === 'unassigned' ? 'outline' : 'default'}
                          onClick={() => toggleAssignment(character.id)}
                          className={character.assignedTo === 'user' ? 'bg-primary' : character.assignedTo === 'ai' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {character.assignedTo === 'user' ? 'You' :
                           character.assignedTo === 'ai' ? 'AI Partner' :
                           'Assign Role'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Voice Selector Modal */}
            {selectingForCharacter && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                  <CardHeader>
                    <CardTitle>Select AI Voice</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto max-h-[60vh]">
                    <div className="grid gap-3">
                      {mockVoices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => selectVoice(voice.id)}
                          className={`w-full p-4 rounded-lg border text-left transition-all hover:border-primary ${
                            characters.find(c => c.id === selectingForCharacter)?.voiceId === voice.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{voice.name}</p>
                              <p className="text-sm text-muted-foreground">{voice.accent} • {voice.gender}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                {voice.category}
                              </span>
                              {characters.find(c => c.id === selectingForCharacter)?.voiceId === voice.id && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" onClick={() => setSelectingForCharacter(null)}>
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <p className="text-muted-foreground">
                {canProceed 
                  ? 'Ready to rehearse!' 
                  : 'Assign yourself to at least one character and select a voice for AI characters'}
              </p>
              <Button 
                variant="hero" 
                size="lg"
                disabled={!canProceed}
                onClick={() => {
                  updateScript(script.id, { characters, status: 'ready' });
                  navigate(`/rehearse/${script.id}`);
                }}
              >
                Start Rehearsal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
