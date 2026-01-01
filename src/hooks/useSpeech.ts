import { useCallback, useEffect, useRef, useState } from 'react';

type SpeakOptions = {
  /** Any stable key that should map to a distinct voice (ex: selected voiceId). */
  voiceKey?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
};

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => window.speechSynthesis.getVoices());
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
  }, []);

  const speak = useCallback(
    (text: string, options?: SpeakOptions | (() => void)) => {
      const opts: SpeakOptions =
        typeof options === 'function' ? { onEnd: options } : (options ?? {});

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const availableVoices = voices.length ? voices : window.speechSynthesis.getVoices();
      const lang = (opts.lang ?? 'en').toLowerCase();
      const candidates =
        availableVoices.filter(v => (v.lang || '').toLowerCase().startsWith(lang)) || [];
      const pool = candidates.length ? candidates : availableVoices;

      let selectedVoice: SpeechSynthesisVoice | undefined;
      if (pool.length) {
        if (opts.voiceKey) {
          selectedVoice = pool[hashString(opts.voiceKey) % pool.length];
        } else {
          selectedVoice =
            pool.find(v => v.name.includes('Google')) ||
            pool.find(v => (v.lang || '').toLowerCase().startsWith('en')) ||
            pool[0];
        }
      }

      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.rate = opts.rate ?? 0.9;
      utterance.pitch =
        opts.pitch ??
        (opts.voiceKey
          ? clamp(1 + ((hashString(opts.voiceKey) % 5) - 2) * 0.05, 0.8, 1.2)
          : 1);

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        opts.onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        opts.onEnd?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voices]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
