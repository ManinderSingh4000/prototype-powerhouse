import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface LiveTranscriptProps {
  isListening: boolean;
  isConnecting: boolean;
  expectedText: string;
  partialTranscript: string;
  className?: string;
}

export function LiveTranscript({ 
  isListening, 
  isConnecting,
  expectedText, 
  partialTranscript,
  className = ''
}: LiveTranscriptProps) {
  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {isConnecting ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : isListening ? (
            <div className="relative">
              <Mic className="w-4 h-4 text-primary" />
              <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping" />
            </div>
          ) : (
            <MicOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {isConnecting ? 'Connecting...' : isListening ? 'Listening...' : 'Ready to listen'}
          </span>
        </div>

        {/* Expected text (faded) */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Your line:</p>
          <p className="text-sm text-muted-foreground italic">"{expectedText}"</p>
        </div>

        {/* What we're hearing */}
        {(isListening || partialTranscript) && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hearing:</p>
            <p className="text-sm text-foreground">
              {partialTranscript || <span className="text-muted-foreground">Speak your line...</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
