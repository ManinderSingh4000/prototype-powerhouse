import { useState, useCallback, useRef } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Map character voice IDs to ElevenLabs voice IDs
const VOICE_MAP: Record<string, string> = {
  // Default voices for variety
  'voice-1': 'JBFqnCBsd6RMkjVDRZzb', // George - deep male
  'voice-2': 'EXAVITQu4vr4xnSDxMaL', // Sarah - clear female
  'voice-3': 'IKne3meq5aSn9XLyUdCD', // Charlie - warm male
  'voice-4': 'FGY2WhTYpPnrIDTdsKH5', // Laura - expressive female
  'voice-5': 'onwK4e9ZLuTAKqWW03F9', // Daniel - British male
  'voice-6': 'pFZP5JQG7iQjIQuC4Bku', // Lily - young female
};

interface UseElevenLabsTTSOptions {
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useElevenLabsTTS(options: UseElevenLabsTTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  const speak = useCallback(async (
    text: string, 
    voiceKey?: string,
    onEnd?: () => void
  ) => {
    try {
      setError(null);
      setIsLoading(true);
      onEndCallbackRef.current = onEnd || null;

      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      // Get voice ID from map or use provided ID
      let voiceId = VOICE_MAP['voice-1']; // Default
      if (voiceKey) {
        if (VOICE_MAP[voiceKey]) {
          voiceId = VOICE_MAP[voiceKey];
        } else if (voiceKey.length > 15) {
          // Looks like a real ElevenLabs voice ID
          voiceId = voiceKey;
        } else {
          // Hash the key to pick a voice consistently
          const hash = voiceKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const voiceKeys = Object.keys(VOICE_MAP);
          voiceId = VOICE_MAP[voiceKeys[hash % voiceKeys.length]];
        }
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        onEndCallbackRef.current?.();
        options.onEnd?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        setError('Failed to play audio');
        options.onError?.('Failed to play audio');
      };

      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMessage);
      setIsLoading(false);
      setIsSpeaking(false);
      options.onError?.(errorMessage);
    }
  }, [options]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  };
}
