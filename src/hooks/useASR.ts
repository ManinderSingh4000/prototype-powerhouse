import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ASRMetrics {
  accuracy: number; // 0-100 percentage
  wordMatchRate: number; // percentage of words matched
  expectedWords: number;
  spokenWords: number;
  matchedWords: number;
  missedWords: string[];
  extraWords: string[];
  timeTaken: number; // milliseconds
}

interface UseASROptions {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string, metrics: ASRMetrics) => void;
  onError?: (error: string) => void;
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '') // Keep apostrophes for contractions
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

  // Check what was matched and missed
  expectedWords.forEach(word => {
    if (spokenSet.has(word)) {
      matchedWords.push(word);
    } else {
      missedWords.push(word);
    }
  });

  // Check for extra words not in expected
  spokenWords.forEach(word => {
    if (!expectedSet.has(word)) {
      extraWords.push(word);
    }
  });

  const wordMatchRate = expectedWords.length > 0 
    ? (matchedWords.length / expectedWords.length) * 100 
    : 0;

  // Accuracy factors in extra words as a penalty
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
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const expectedTextRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
    setIsConnecting(false);
  }, []);

  const startListening = useCallback(async (expectedText: string) => {
    try {
      setError(null);
      setIsConnecting(true);
      setPartialTranscript('');
      setFinalTranscript('');
      expectedTextRef.current = expectedText;
      startTimeRef.current = Date.now();

      // Get token from edge function
      const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (fnError || !data?.token) {
        throw new Error(fnError?.message || 'Failed to get ASR token');
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        } 
      });
      mediaStreamRef.current = stream;

      // Create WebSocket connection
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/scribe?token=${data.token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        // Send initial config
        ws.send(JSON.stringify({
          type: 'configure',
          audio_format: 'pcm_16000',
          sample_rate: 16000,
          commit_strategy: 'vad',
        }));

        // Set up audio processing
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcm16[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)));
            }
            const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
            ws.send(JSON.stringify({ type: 'audio', audio: base64 }));
          }
        };

        setIsConnecting(false);
        setIsListening(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'partial_transcript') {
            setPartialTranscript(message.text || '');
            options.onPartialTranscript?.(message.text || '');
          } else if (message.type === 'committed_transcript') {
            const transcript = message.text || '';
            setFinalTranscript(prev => prev + ' ' + transcript);
            setPartialTranscript('');
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('Connection error occurred');
        options.onError?.('Connection error occurred');
        cleanup();
      };

      ws.onclose = () => {
        setIsListening(false);
        setIsConnecting(false);
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMessage);
      options.onError?.(errorMessage);
      cleanup();
    }
  }, [cleanup, options]);

  const stopListening = useCallback((): ASRMetrics | null => {
    const timeTaken = Date.now() - startTimeRef.current;
    const spoken = finalTranscript.trim() + ' ' + partialTranscript.trim();
    
    cleanup();

    if (spoken.trim()) {
      const metrics = calculateMetrics(expectedTextRef.current, spoken.trim(), timeTaken);
      options.onFinalTranscript?.(spoken.trim(), metrics);
      return metrics;
    }

    return null;
  }, [cleanup, finalTranscript, partialTranscript, options]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isListening,
    isConnecting,
    partialTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
  };
}
