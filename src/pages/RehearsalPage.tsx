import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useScripts } from '@/context/ScriptsContext';
import { useSpeech } from '@/hooks/useSpeech';
import { Play, Pause, RotateCcw, Mic, Volume2, ArrowLeft, Settings } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

type RehearsalStatus = 'idle' | 'listening' | 'countdown' | 'playing' | 'paused' | 'waiting' | 'completed';

export default function RehearsalPage() {
  const { id } = useParams();
  const { getScript, scripts } = useScripts();
  const { speak, stop, isSpeaking } = useSpeech();
  const hasSpokenRef = useRef(false);
  
  const [status, setStatus] = useState<RehearsalStatus>('idle');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  
  // Get script from context or fall back to first ready script
  const script = getScript(id || '') || scripts.find(s => s.status === 'ready') || scripts[0];
  
  if (!script || script.lines.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">No script available</h1>
            <p className="text-muted-foreground mb-8">Upload a script and assign characters first.</p>
            <Link to="/scripts">
              <Button variant="hero">Go to Scripts</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  const currentLine = script.lines[currentLineIndex];
  const userCharacter = script.characters.find(c => c.assignedTo === 'user');
  const aiCharacter = script.characters.find(c => c.assignedTo === 'ai');

  // Simulate "Action" voice detection
  const startListening = useCallback(() => {
    setStatus('listening');
  }, []);

  const simulateActionDetected = useCallback(() => {
    setStatus('countdown');
    setCountdown(3);
    hasSpokenRef.current = false;
  }, []);

  // Countdown effect
  useEffect(() => {
    if (status === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'countdown' && countdown === 0) {
      setStatus('playing');
      setCurrentLineIndex(0);
    }
  }, [status, countdown]);

  // Speak AI lines with real TTS
  useEffect(() => {
    if (status === 'playing' && !hasSpokenRef.current) {
      const line = script.lines[currentLineIndex];
      const isAILine = line?.characterName === aiCharacter?.name;
      
      if (isAILine) {
        hasSpokenRef.current = true;
        // Use real TTS for AI lines
        speak(line.text, () => {
          hasSpokenRef.current = false;
          if (currentLineIndex < script.lines.length - 1) {
            setCurrentLineIndex(prev => prev + 1);
          } else {
            setStatus('completed');
          }
        });
      } else {
        // User's turn - wait for them
        setStatus('waiting');
      }
    }
  }, [status, currentLineIndex, script.lines, aiCharacter, speak]);

  const handleUserLineComplete = () => {
    hasSpokenRef.current = false;
    if (currentLineIndex < script.lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setStatus('playing');
    } else {
      setStatus('completed');
    }
  };

  const reset = () => {
    stop();
    hasSpokenRef.current = false;
    setStatus('idle');
    setCurrentLineIndex(0);
    setCountdown(3);
  };

  const togglePause = () => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/scripts" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Exit Rehearsal
              </Link>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Scene Title */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold mb-2">{script.title}</h1>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>You: <span className="text-primary font-medium">{userCharacter?.name}</span></span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span>AI: <span className="text-accent-foreground font-medium">{aiCharacter?.name}</span></span>
              </div>
            </div>

            {/* Main Rehearsal Area */}
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-0">
                {/* Status Bar */}
                <div className={`px-6 py-3 flex items-center justify-between ${
                  status === 'playing' || status === 'waiting' ? 'bg-green-500/10 border-b border-green-500/20' :
                  status === 'listening' ? 'bg-primary/10 border-b border-primary/20' :
                  status === 'countdown' ? 'bg-accent/10 border-b border-accent/20' :
                  'bg-muted border-b border-border'
                }`}>
                  <span className="text-sm font-medium">
                    {status === 'idle' && 'Ready to begin'}
                    {status === 'listening' && 'Listening for "Action!"...'}
                    {status === 'countdown' && `Starting in ${countdown}...`}
                    {status === 'playing' && 'Scene in progress'}
                    {status === 'waiting' && 'Your line'}
                    {status === 'paused' && 'Paused'}
                    {status === 'completed' && 'Scene complete!'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Line {currentLineIndex + 1} of {script.lines.length}
                  </span>
                </div>

                {/* Script Display */}
                <div className="p-8 min-h-[400px] flex flex-col">
                  {status === 'idle' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse-glow">
                        <Mic className="w-12 h-12 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">Ready to Rehearse</h2>
                      <p className="text-muted-foreground mb-8 max-w-md">
                        Click "Start" and say "Action!" when you're ready, or use the button below to begin immediately.
                      </p>
                      <div className="flex items-center gap-4">
                        <Button variant="hero" size="xl" onClick={startListening}>
                          <Mic className="w-5 h-5 mr-2" />
                          Start Listening
                        </Button>
                        <Button variant="glass" size="xl" onClick={simulateActionDetected}>
                          <Play className="w-5 h-5 mr-2" />
                          Skip to Scene
                        </Button>
                      </div>
                    </div>
                  ) : status === 'listening' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <Mic className="w-16 h-16 text-primary relative z-10" />
                      </div>
                      <h2 className="text-3xl font-serif font-bold mb-4">Say "Action!"</h2>
                      <p className="text-muted-foreground mb-8">
                        Or click the button to start immediately
                      </p>
                      <Button variant="glass" size="lg" onClick={simulateActionDetected}>
                        Start Now
                      </Button>
                    </div>
                  ) : status === 'countdown' ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-9xl font-bold text-primary mb-4">{countdown}</div>
                        <p className="text-xl text-muted-foreground">Get ready...</p>
                      </div>
                    </div>
                  ) : status === 'completed' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                        <Volume2 className="w-12 h-12 text-green-500" />
                      </div>
                      <h2 className="text-3xl font-serif font-bold mb-2">Scene Complete!</h2>
                      <p className="text-muted-foreground mb-8">Great rehearsal! Ready to go again?</p>
                      <div className="flex items-center gap-4">
                        <Button variant="hero" size="lg" onClick={reset}>
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Run Again
                        </Button>
                        <Link to="/scripts">
                          <Button variant="glass" size="lg">
                            Back to Scripts
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      {/* Current Line Display */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-2xl">
                          <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                            currentLine?.characterName === userCharacter?.name
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent/10 text-accent-foreground'
                          }`}>
                            {currentLine?.characterName}
                          </span>
                          <p className="text-3xl leading-relaxed font-serif">
                            "{currentLine?.text}"
                          </p>
                        </div>
                      </div>

                      {/* User Action for their lines */}
                      {status === 'waiting' && (
                        <div className="pt-6 border-t border-border flex justify-center">
                          <Button variant="hero" size="lg" onClick={handleUserLineComplete}>
                            <Mic className="w-5 h-5 mr-2" />
                            I've Said My Line
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            {(status === 'playing' || status === 'paused' || status === 'waiting') && (
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={reset}>
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-40"
                  onClick={togglePause}
                >
                  {status === 'paused' ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Upcoming Lines Preview */}
            {(status === 'playing' || status === 'waiting') && currentLineIndex < script.lines.length - 1 && (
              <Card className="mt-8 bg-card/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Coming up</p>
                  <div className="space-y-2">
                    {script.lines.slice(currentLineIndex + 1, currentLineIndex + 4).map((line, idx) => (
                      <div key={line.id} className={`flex items-start gap-3 ${idx === 0 ? 'opacity-100' : 'opacity-50'}`}>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          line.characterName === userCharacter?.name
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent-foreground'
                        }`}>
                          {line.characterName}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          {line.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
