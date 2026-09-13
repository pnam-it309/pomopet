/**
 * Web Audio Engine for Pomopet
 * Procedural synthesizers for chimes, timer ticks, level-up fanfare and brown-noise rain ambient sound.
 */

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  public isAmbientPlaying = false;
  public soundEnabled = true;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 587.33, duration = 0.15, type: OscillatorType = 'sine') {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  playClick() {
    this.playBeep(880, 0.08, 'sine');
  }

  playTimerAlarm() {
    if (!this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.4, 'triangle'), idx * 180);
    });
  }

  playSuccess() {
    if (!this.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25, 'triangle'), idx * 120);
    });
  }

  toggleAmbient(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isAmbientPlaying) {
      if (this.ambientSource) {
        try {
          this.ambientSource.stop();
        } catch {}
        this.ambientSource = null;
      }
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      // Procedural soft rain noise generator (brown-pink noise)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
      }

      this.ambientSource = this.ctx.createBufferSource();
      this.ambientSource.buffer = noiseBuffer;
      this.ambientSource.loop = true;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.ambientSource.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      this.ambientSource.start();
      this.isAmbientPlaying = true;
      return true;
    } catch {
      this.isAmbientPlaying = false;
      return false;
    }
  }

  triggerHaptic() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }
  }
}

export const sound = new WebAudioEngine();
