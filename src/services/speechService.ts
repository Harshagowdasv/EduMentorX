export interface SpeechOptions {
  onResult?: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

export class SpeechService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  isSpeechSupported(): boolean {
    return Boolean(this.synth);
  }

  isRecognitionSupported(): boolean {
    return Boolean(this.recognition);
  }

  speak(text: string, voiceName?: string, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synth) return;

    this.synth.cancel(); // Stop any ongoing speech

    // Clean markdown formatting before speaking
    const cleanText = text.replace(/[*_#`~]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (voiceName) {
      const voices = this.synth.getVoices();
      const selected = voices.find((v) => v.name === voiceName);
      if (selected) utterance.voice = selected;
    }

    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  startListening(options: SpeechOptions): void {
    if (!this.recognition) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      options.onResult?.(transcript);
    };

    this.recognition.onerror = (event: any) => {
      options.onError?.(event.error || 'Voice input error');
    };

    this.recognition.onend = () => {
      options.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch {
      // Already running
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // noop
      }
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }
}

export const speechService = new SpeechService();
