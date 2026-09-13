/* ==========================================================================
   POMOPET MOBILE - Main App Coordinator (OOP)
   Zero Emoji, Clean Vector Layout, High Performance
   ========================================================================== */

class MobileApp {
  constructor() {
    this.currentScreen = 'timer';
    this.mobileInfo = { local_ip: '127.0.0.1', port: 8080, mobile_url: 'http://localhost:8080' };

    // Core Engines
    this.petRenderer = new PetRenderer('pet-canvas');
    this.timerEngine = new PomodoroTimer({
      onStart: (mode, taskId) => this.handleTimerStart(mode, taskId),
      onPause: (isPaused, remSec) => this.handleTimerPause(isPaused, remSec),
      onComplete: () => this.handleTimerComplete(),
      onAbort: () => this.handleTimerAbort(),
      onModeChange: (mode) => this.handleModeChange(mode)
    });

    // Screens
    this.screens = {};

    this.init();
  }

  async init() {
    this.registerServiceWorker();
    this.initClock();
    this.bindGlobalEvents();

    // Instantiate Screen components
    this.screens.auth = new AuthScreen(this);
    this.screens.timer = new TimerScreen(this);
    this.screens.tasks = new TasksScreen(this);
    this.screens.shop = new ShopScreen(this);
    this.screens.inventory = new InventoryScreen(this);
    this.screens.profile = new ProfileScreen(this);

    // Fetch local LAN IP for phone QR
    await this.fetchMobileInfo();

    // Check authentication
    if (!window.apiClient.isAuthenticated()) {
      this.showAuthScreen();
    } else {
      await this.syncState();
      this.switchScreen('timer');
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration error:', err);
      });
    }
  }

  initClock() {
    const clockEl = document.getElementById('status-clock');
    if (!clockEl) return;
    const update = () => {
      const d = new Date();
      clockEl.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };
    update();
    setInterval(update, 10000);
  }

  vibrate(pattern = 15) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch(e) {}
    }
  }

  bindGlobalEvents() {
    // Bottom Nav Tabs
    document.querySelectorAll('.m-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.vibrate(12);
        const targetScreen = e.currentTarget.dataset.screen;
        this.switchScreen(targetScreen);
      });
    });

    // Desktop Toolbar
    const toggleFrameBtn = document.getElementById('btn-toggle-frame');
    if (toggleFrameBtn) {
      toggleFrameBtn.addEventListener('click', () => {
        document.body.classList.toggle('fullscreen-mobile');
      });
    }

    const showWifiQrBtn = document.getElementById('btn-show-wifi-qr');
    if (showWifiQrBtn) {
      showWifiQrBtn.addEventListener('click', () => {
        this.openWifiQrModal();
      });
    }

    // Header ambient audio toggle
    const ambientBtn = document.getElementById('btn-sound-ambient');
    if (ambientBtn) {
      ambientBtn.addEventListener('click', () => {
        this.vibrate(15);
        const playing = this.timerEngine.sound.toggleAmbient();
        ambientBtn.classList.toggle('active', playing);
        this.showToast(playing ? 'Dang phat am thanh mua thu gian' : 'Da tat am thanh nen');
      });
    }

    // Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.closeModal;
        document.getElementById(id).classList.remove('active');
      });
    });

    // Sync header stats from stateStore
    window.stateStore.subscribe('profile', (profile) => {
      if (profile) {
        document.getElementById('header-streak').textContent = profile.streak_days || 1;
        document.getElementById('header-coins').textContent = profile.coins || 0;
        let totalInv = 0;
        if (profile.inventory) {
          totalInv = profile.inventory.reduce((sum, item) => sum + item.quantity, 0);
        }
        document.getElementById('inv-count-badge').textContent = totalInv;
      }
    });
  }

  showAuthScreen() {
    document.querySelectorAll('.mobile-screen').forEach(s => s.classList.remove('active'));
    const authEl = document.getElementById('screen-auth');
    if (authEl) authEl.classList.add('active');

    const nav = document.querySelector('.mobile-bottom-nav');
    if (nav) nav.style.display = 'none';
  }

  onLoginSuccess() {
    const nav = document.querySelector('.mobile-bottom-nav');
    if (nav) nav.style.display = 'flex';
    this.syncState().then(() => {
      this.switchScreen('timer');
    });
  }

  onUnauthorized() {
    this.showAuthScreen();
    this.showToast('Vui long dang nhap de tiep tuc');
  }

  logout() {
    window.apiClient.logout();
    window.stateStore.set('user', null);
    this.showAuthScreen();
    this.showToast('Da dang xuat tai khoan');
  }

  switchScreen(screenName) {
    this.currentScreen = screenName;

    document.querySelectorAll('.m-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screenName);
    });

    document.querySelectorAll('.mobile-screen').forEach(scr => {
      scr.classList.toggle('active', scr.id === `screen-${screenName}`);
    });

    const vp = document.getElementById('mobile-body-viewport');
    if (vp) vp.scrollTop = 0;
  }

  async fetchMobileInfo() {
    try {
      const res = await window.apiClient.get('/api/mobile-info');
      this.mobileInfo = res;
      const wifiBox = document.getElementById('wifi-url-box');
      if (wifiBox) wifiBox.textContent = res.mobile_url;
    } catch(e) {}
  }

  openWifiQrModal() {
    const modal = document.getElementById('modal-wifi-qr');
    const qrImg = document.getElementById('qr-img');
    const qrText = document.getElementById('qr-url-text');
    const url = this.mobileInfo.mobile_url;

    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
    qrText.textContent = url;
    modal.classList.add('active');
  }

  async syncState() {
    try {
      const res = await window.apiClient.get('/api/state');
      window.stateStore.update({
        pet: res.pet,
        timer: res.timer,
        tasks: res.tasks,
        profile: res.profile,
        history: res.history,
        shopCatalog: res.shop_catalog
      });
    } catch (err) {
      console.error('Loi dong bo state:', err);
    }
  }

  // Timer Handlers
  async handleTimerStart(mode, taskId) {
    try {
      const res = await window.apiClient.post('/api/pomodoro/start', {
        mode,
        active_task_id: taskId
      });
      window.stateStore.set('timer', res);
    } catch(e) {}
  }

  async handleTimerPause(isPaused, remSec) {
    try {
      const res = await window.apiClient.post('/api/pomodoro/pause', {
        is_paused: isPaused,
        remaining_seconds: remSec
      });
      window.stateStore.set('timer', res);
    } catch(e) {}
  }

  async handleTimerComplete() {
    try {
      this.vibrate([100, 50, 100, 50, 150]);
      const res = await window.apiClient.post('/api/pomodoro/complete');
      if (res.coins_earned > 0) {
        this.showToast(`Hoan thanh! +${res.coins_earned} Xu, +${res.exp_earned} EXP`);
      }
      this.petRenderer.spawnConfetti();
      this.timerEngine.sound.playLevelUpSound();
      await this.syncState();
    } catch(e) {}
  }

  async handleTimerAbort() {
    try {
      const setting = await window.apiClient.post('/api/pomodoro/abort');
      window.stateStore.set('timer', setting);
      this.showToast('Phien tap trung da dung lai');
    } catch(e) {}
  }

  handleModeChange(mode) {
    const pose = (mode === 'focus') ? 'idle' : 'resting';
    window.apiClient.post('/api/pet/pose', { state: pose }).then(p => {
      window.stateStore.set('pet', p);
    }).catch(() => {});
  }

  showToast(msg) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>${this.escape(msg)}</span>`;
    stack.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translate3d(0, -15px, 0)';
      t.style.transition = 'all 0.25s ease';
      setTimeout(() => t.remove(), 250);
    }, 2800);
  }

  escape(t) {
    if (!t) return '';
    return t.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new MobileApp();
});
