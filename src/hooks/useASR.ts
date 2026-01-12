import { useState, useCallback, useRef, useEffect } from 'react';
import { useScribe, CommitStrategy } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';

export interface ASRMetrics {
  accuracy: number;
  wordMatchRate: number;
  expectedWords: number;
  spokenWords: number;
  matchedWords: number;
  missedWords: string[];
  extraWords: string[];
  timeTaken: number;
}

interface UseASROptions {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string, metrics: ASRMetrics) => void;
  onError?: (error: string) => void;
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function calculateMetrics(expected: string, spoken: string, timeTaken: number): ASRMetrics {
  const expectedWords = normalizeText(expected);
  const spokenWords = normalizeText(spoken);

  const expectedSet = new Set(expectedWords);
  const spokenSet = new Set(spokenWords);

  const matchedWords: string[] = [];
  const missedWords: string[] = [];
  const extraWords: string[] = [];

  expectedWords.forEach(word => {
    if (spokenSet.has(word)) {
      matchedWords.push(word);
    } else {
      missedWords.push(word);
    }
  });

  spokenWords.forEach(word => {
    if (!expectedSet.has(word)) {
      extraWords.push(word);
    }
  });

  const wordMatchRate = expectedWords.length > 0 
    ? (matchedWords.length / expectedWords.length) * 100 
    : 0;

  const totalRelevant = expectedWords.length + extraWords.length;
  const accuracy = totalRelevant > 0 
    ? (matchedWords.length / totalRelevant) * 100 
    : 0;

  return {
    accuracy: Math.round(accuracy),
    wordMatchRate: Math.round(wordMatchRate),
    expectedWords: expectedWords.length,
    spokenWords: spokenWords.length,
    matchedWords: matchedWords.length,
    missedWords: [...new Set(missedWords)],
    extraWords: [...new Set(extraWords)],
    timeTaken,
  };
}

export function useASR(options: UseASROptions = {}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');

  const expectedTextRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data) => {
      options.onPartialTranscript?.(data.text);
    },
    onCommittedTranscript: (data) => {
      setAccumulatedTranscript(prev => {
        const newText = prev ? `${prev} ${data.text}` : data.text;
        return newText;
      });
    },
    onError: (err) => {
      console.error('Scribe error:', err);
      setError('Connection error occurred');
      options.onError?.('Connection error occurred');
    },
  });

  const startListening = useCallback(async (expectedText: string) => {
    try {
      setError(null);
      setIsConnecting(true);
      setAccumulatedTranscript('');
      expectedTextRef.current = expectedText;
      startTimeRef.current = Date.now();

      const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (fnError || !data?.token) {
        throw new Error(fnError?.message || 'Failed to get ASR token');
      }

      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setIsConnecting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMessage);
      options.onError?.(errorMessage);
      setIsConnecting(false);
    }
  }, [scribe, options]);

  const stopListening = useCallback((): ASRMetrics | null => {
    const timeTaken = Date.now() - startTimeRef.current;
    const spoken = accumulatedTranscript.trim() + ' ' + (scribe.partialTranscript || '').trim();
    
    scribe.disconnect();

    if (spoken.trim()) {
      const metrics = calculateMetrics(expectedTextRef.current, spoken.trim(), timeTaken);
      options.onFinalTranscript?.(spoken.trim(), metrics);
      return metrics;
    }

    return null;
  }, [scribe, accumulatedTranscript, options]);

  useEffect(() => {
    return () => {
      scribe.disconnect();
    };
  }, [scribe]);

  return {
    isListening: scribe.isConnected,
    isConnecting,
    partialTranscript: scribe.partialTranscript || '',
    finalTranscript: accumulatedTranscript,
    error,
    startListening,
    stopListening,
  };
}
