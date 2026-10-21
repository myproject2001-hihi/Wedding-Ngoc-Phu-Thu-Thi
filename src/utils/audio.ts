/**
 * Procedural romantic wedding melody and interactive audio effects
 * using the Web Audio API (no external asset dependencies or network blocks)
 */

class WeddingAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTimer: number | null = null;
  private noteIndex: number = 0;
  private gainNode: GainNode | null = null;

  // Romantic Canon in D / wedding acoustic progression notes (frequencies in Hz)
  // D - A - Bm - F#m - G - D - G - A progression
  private melodyNotes: Array<{ freq: number; dur: number; type: 'chord' | 'melody' }> = [
    // Chord 1: D major
    { freq: 293.66, dur: 0.8, type: 'chord' }, // D4
    { freq: 369.99, dur: 0.6, type: 'melody' }, // F#4
    { freq: 440.00, dur: 0.6, type: 'melody' }, // A4
    { freq: 587.33, dur: 1.2, type: 'melody' }, // D5

    // Chord 2: A major
    { freq: 220.00, dur: 0.8, type: 'chord' }, // A3
    { freq: 329.63, dur: 0.6, type: 'melody' }, // E4
    { freq: 440.00, dur: 0.6, type: 'melody' }, // A4
    { freq: 554.37, dur: 1.2, type: 'melody' }, // C#5

    // Chord 3: B minor
    { freq: 246.94, dur: 0.8, type: 'chord' }, // B3
    { freq: 369.99, dur: 0.6, type: 'melody' }, // F#4
    { freq: 493.88, dur: 0.6, type: 'melody' }, // B4
    { freq: 440.00, dur: 1.0, type: 'melody' }, // A4

    // Chord 4: F# minor
    { freq: 185.00, dur: 0.8, type: 'chord' }, // F#3
    { freq: 277.18, dur: 0.6, type: 'melody' }, // C#4
    { freq: 369.99, dur: 0.6, type: 'melody' }, // F#4
    { freq: 329.63, dur: 1.2, type: 'melody' }, // E4

    // Chord 5: G major
    { freq: 196.00, dur: 0.8, type: 'chord' }, // G3
    { freq: 293.66, dur: 0.6, type: 'melody' }, // D4
    { freq: 392.00, dur: 0.6, type: 'melody' }, // G4
    { freq: 493.88, dur: 1.0, type: 'melody' }, // B4

    // Chord 6: D major
    { freq: 293.66, dur: 0.8, type: 'chord' }, // D4
    { freq: 369.99, dur: 0.6, type: 'melody' }, // F#4
    { freq: 440.00, dur: 0.6, type: 'melody' }, // A4
    { freq: 392.00, dur: 1.0, type: 'melody' }, // G4

    // Chord 7: G major to A
    { freq: 196.00, dur: 0.8, type: 'chord' },
    { freq: 329.63, dur: 0.6, type: 'melody' },
    { freq: 440.00, dur: 0.8, type: 'melody' },
    { freq: 493.88, dur: 1.4, type: 'melody' },
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.22; // gentle soft volume
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft, warm music box / acoustic chime note
  private playNote(freq: number, duration: number, isChordRoot = false) {
    if (!this.ctx || !this.gainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Warm sine + subtle triangle overtone
    osc.type = isChordRoot ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm bell/piano envelope: quick attack, natural exponential decay
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(isChordRoot ? 0.12 : 0.18, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.5);

    osc.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + duration * 1.6);
  }

  public playMusic() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNextNote();
  }

  private scheduleNextNote = () => {
    if (!this.isPlaying) return;

    const note = this.melodyNotes[this.noteIndex];
    this.playNote(note.freq, note.dur, note.type === 'chord');

    this.noteIndex = (this.noteIndex + 1) % this.melodyNotes.length;
    const delay = note.dur * 750; // tempo multiplier

    this.currentTimer = window.setTimeout(this.scheduleNextNote, delay);
  };

  public pauseMusic() {
    this.isPlaying = false;
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.isPlaying) {
      this.pauseMusic();
      return false;
    } else {
      this.playMusic();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Sound effect when unsealing the envelope (paper whisper + golden shimmer)
  public playUnsealSound() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Gentle paper slide swoosh
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    // 2. Delicate royal golden chime (three ascending harmonic notes)
    const chimes = [587.33, 880, 1174.66]; // D5, A5, D6
    chimes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  }
}

export const weddingAudio = new WeddingAudioManager();
