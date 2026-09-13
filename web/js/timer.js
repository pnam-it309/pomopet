/* ==========================================================================
   POMOPET MOBILE - Pomodoro Timer Engine & Web Audio Synthesizer (OOP)
   Accurate Countdown, SVG Arc Physics & Procedural Audio Chimes
   ========================================================================== */

class WebAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 587.33, duration = 0.15, type = 'sine') {
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
    } catch (e) {}
  }

  playTimerAlarm() {
    // 3 pleasant bell tones
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.4, 'triangle'), idx * 180);
    });
  }

  playLevelUpSound() {
    // Fanfare arpeggio
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25, 'triangle'), idx * 120);
    });
  }

  toggleAmbient() {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isAmbientPlaying) {
      if (this.ambientSource) {
        try { this.ambientSource.stop(); } catch(e) {}
        this.ambientSource = null;
      }
      this.isAmbientPlaying = false;
      return false;
    }

    // Generate brown-pink noise (gentle rain sound) procedurally
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost rain volume
    }

    this.ambientSource = this.ctx.createBufferSource();
    this.ambientSource.buffer = noiseBuffer;
    this.ambientSource.loop = true;

    // Filter to make it soft rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.ambientSource.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.ambientSource.start();
    this.isAmbientPlaying = true;
    return true;
  }
}

class PomodoroTimer {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.sound = new WebAudioEngine();

    // Default settings
    this.mode = 'focus'; // focus | short_break | long_break
    this.focusMinutes = 25;
    this.shortBreakMinutes = 5;
    this.longBreakMinutes = 15;
    this.longBreakInterval = 4;
    this.cycleCount = 1;

    // State
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.isRunning = false;
    this.intervalId = null;
    this.activeTaskId = '';

    // Ring SVG properties
    this.circumference = 2 * Math.PI * 105; // radius is 105 -> ~659.73px

    this.dom = {
      digits: document.getElementById('timer-digits'),
      circle: document.getElementById('timer-ring-circle'),
      toggleBtn: document.getElementById('btn-timer-toggle'),
      toggleLabel: document.getElementById('btn-toggle-label'),
      abortBtn: document.getElementById('btn-timer-abort'),
      cycleBadge: document.getElementById('timer-cycle-badge'),
      statusText: document.getElementById('timer-status-text')
    };

    this.updateDisplay();
  }

  syncWithBackend(timerData) {
    if (!timerData) return;
    this.focusMinutes = timerData.focus_minutes || 25;
    this.shortBreakMinutes = timerData.short_break_minutes || 5;
    this.longBreakMinutes = timerData.long_break_minutes || 15;
    this.longBreakInterval = timerData.long_break_interval || 4;
    this.cycleCount = timerData.cycle_count || 1;
    this.activeTaskId = timerData.active_task_id || '';

    // If local timer is idle, update to backend settings
    if (!this.isRunning) {
      this.mode = timerData.mode || 'focus';
      this.totalSeconds = timerData.total_duration_sec || (this.getDurationForMode(this.mode) * 60);
      this.remainingSeconds = timerData.time_remaining_sec || this.totalSeconds;
      this.updateDisplay();
      this.updateModePillsUI();
    }
  }

  getDurationForMode(mode) {
    switch (mode) {
      case 'short_break': return this.shortBreakMinutes;
      case 'long_break': return this.longBreakMinutes;
      case 'focus':
      default: return this.focusMinutes;
    }
  }

  switchMode(mode) {
    if (this.isRunning) {
      if (!confirm('Bạn có muốn đổi chế độ và làm mới phiên hẹn giờ?')) return;
      this.pauseTimer();
    }
    this.mode = mode;
    this.totalSeconds = this.getDurationForMode(mode) * 60;
    this.remainingSeconds = this.totalSeconds;

    this.updateModePillsUI();
    this.updateDisplay();

    if (this.callbacks.onModeChange) {
      this.callbacks.onModeChange(mode);
    }
  }

  updateModePillsUI() {
    document.querySelectorAll('.m-mode-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.mode);
    });

    if (this.dom.circle) {
      if (this.mode === 'focus') {
        this.dom.circle.style.stroke = 'url(#mGradFocus)';
      } else {
        this.dom.circle.style.stroke = 'url(#mGradBreak)';
      }
    }
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
      if (this.callbacks.onPause) {
        this.callbacks.onPause(true, this.remainingSeconds);
      }
    } else {
      this.startTimer();
      if (this.callbacks.onStart) {
        this.callbacks.onStart(this.mode, this.activeTaskId);
      }
    }
  }

  startTimer() {
    this.sound.playBeep(523.25, 0.1);
    this.isRunning = true;
    this.updateControlsUI();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    this.sound.playBeep(392.00, 0.1);
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateControlsUI();
  }

  abortSession() {
    this.pauseTimer();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    if (this.callbacks.onAbort) {
      this.callbacks.onAbort();
    }
  }

  completeSession() {
    this.pauseTimer();
    this.sound.playTimerAlarm();

    // Advance cycle count
    if (this.mode === 'focus') {
      this.cycleCount++;
    }

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }

    // Auto-switch mode based on cycle
    if (this.mode === 'focus') {
      if (this.cycleCount % this.longBreakInterval === 0) {
        this.switchMode('long_break');
      } else {
        this.switchMode('short_break');
      }
    } else {
      this.switchMode('focus');
    }
  }

  updateControlsUI() {
    if (this.dom.toggleBtn) {
      if (this.isRunning) {
        this.dom.toggleLabel.textContent = 'Tam Dung';
        this.dom.toggleBtn.querySelector('.m-btn-ico').innerHTML = '<svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      } else {
        this.dom.toggleLabel.textContent = this.remainingSeconds < this.totalSeconds ? 'Tiep Tuc' : 'Bat Dau';
        this.dom.toggleBtn.querySelector('.m-btn-ico').innerHTML = '<svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
      }
    }

    if (this.dom.abortBtn) {
      this.dom.abortBtn.disabled = !this.isRunning && (this.remainingSeconds === this.totalSeconds);
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.dom.digits) {
      this.dom.digits.textContent = timeStr;
    }

    // SVG Arc
    if (this.dom.circle) {
      const progressRatio = this.remainingSeconds / (this.totalSeconds || 1);
      const offset = this.circumference * (1 - progressRatio);
      this.dom.circle.style.strokeDashoffset = offset;
    }

    if (this.dom.cycleBadge) {
      this.dom.cycleBadge.textContent = `Chu ky #${this.cycleCount}`;
    }

    if (this.dom.statusText) {
      if (this.isRunning) {
        this.dom.statusText.textContent = this.mode === 'focus' ? 'Dang tap trung cao do' : 'Dang trong gio giai lao';
      } else {
        this.dom.statusText.textContent = this.remainingSeconds < this.totalSeconds ? 'Dang tam dung' : 'San sang bat dau';
      }
    }

    this.updateControlsUI();
  }
}

window.PomodoroTimer = PomodoroTimer;
