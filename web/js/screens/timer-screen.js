/* ==========================================================================
   POMOPET MOBILE - Timer & Pet Screen Component
   Zero Emoji, Clean Vector Layout
   ========================================================================== */

class TimerScreen {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('screen-timer');
    this.timerEngine = app.timerEngine;
    this.petRenderer = app.petRenderer;
    this.init();
  }

  init() {
    this.bindEvents();
    window.stateStore.subscribe('pet', (pet) => this.renderPet(pet));
    window.stateStore.subscribe('timer', (timer) => this.renderTimer(timer));
  }

  bindEvents() {
    document.getElementById('btn-quick-pat').addEventListener('click', () => {
      this.app.vibrate(20);
      this.patPet();
    });

    document.getElementById('btn-quick-feed').addEventListener('click', () => {
      this.app.vibrate(20);
      this.quickFeed();
    });

    document.getElementById('btn-change-pet').addEventListener('click', () => {
      this.app.vibrate(15);
      this.openAdoptModal();
    });

    document.getElementById('pet-actor-container').addEventListener('click', () => {
      this.app.vibrate(20);
      this.patPet();
    });

    document.getElementById('btn-edit-name').addEventListener('click', () => {
      const pet = window.stateStore.get('pet');
      const cur = pet?.name || 'Mochi';
      const n = prompt('Nhap ten moi cho thu cung:', cur);
      if (n && n.trim()) this.renamePet(n.trim());
    });

    document.querySelectorAll('.m-mode-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.app.vibrate(12);
        const mode = e.currentTarget.dataset.mode;
        this.timerEngine.switchMode(mode);
      });
    });

    document.getElementById('btn-timer-toggle').addEventListener('click', () => {
      this.app.vibrate(20);
      this.timerEngine.toggleTimer();
    });

    document.getElementById('btn-timer-abort').addEventListener('click', () => {
      this.app.vibrate(30);
      if (confirm('Ban co chac chan muon dung phien tap trung khong?')) {
        this.timerEngine.abortSession();
      }
    });

    document.getElementById('btn-timer-complete').addEventListener('click', () => {
      this.app.vibrate([80, 40, 100]);
      this.timerEngine.completeSession();
    });

    document.getElementById('btn-select-task').addEventListener('click', () => {
      this.app.switchScreen('tasks');
    });

    document.getElementById('btn-timer-settings').addEventListener('click', () => {
      this.app.vibrate(15);
      const m = document.getElementById('modal-settings');
      const timer = window.stateStore.get('timer');
      if (timer) {
        document.getElementById('setting-focus-mins').value = timer.focus_minutes;
        document.getElementById('setting-short-mins').value = timer.short_break_minutes;
        document.getElementById('setting-long-mins').value = timer.long_break_minutes;
        document.getElementById('setting-long-interval').value = timer.long_break_interval;
      }
      m.classList.add('active');
    });

    document.getElementById('btn-save-settings').addEventListener('click', () => {
      this.app.vibrate(20);
      this.saveTimerSettings();
    });

    document.getElementById('btn-confirm-adopt').addEventListener('click', () => {
      this.app.vibrate(25);
      const active = document.querySelector('.species-card.active');
      const species = active ? active.dataset.species : 'cat';
      const name = document.getElementById('input-adopt-name').value.trim() || 'Mochi';
      this.adoptPet(species, name);
    });
  }

  renderPet(pet) {
    if (!pet) return;

    document.body.className = pet.room_theme || 'theme-cozy';
    this.petRenderer.updatePetData(pet);

    document.getElementById('pet-name').textContent = pet.name;
    const speciesMap = { cat: 'Meo Mochi', dragon: 'Hoa Long Sparky', sprout: 'Mam Sprout', penguin: 'Canh Cut Pingu' };
    document.getElementById('pet-species-badge').textContent = speciesMap[pet.species] || pet.species;

    const stageMap = { egg: 'Trung Than', baby: 'Cap So Sinh', teen: 'Cap Thieu Nien', adult: 'Cap Truong Thanh', mythic: 'Than Thu' };
    document.getElementById('pet-stage-badge').textContent = stageMap[pet.stage] || pet.stage;

    document.getElementById('pet-level').textContent = `Lv. ${pet.level}`;
    document.getElementById('pet-exp-text').textContent = `${pet.exp} / ${pet.exp_to_next} EXP`;
    const expPct = Math.min(100, Math.round((pet.exp / pet.exp_to_next) * 100));
    document.getElementById('pet-exp-bar').style.width = `${expPct}%`;

    document.getElementById('val-hunger').textContent = `${pet.hunger}%`;
    document.getElementById('bar-hunger').style.width = `${pet.hunger}%`;
    document.getElementById('val-happy').textContent = `${pet.happiness}%`;
    document.getElementById('bar-happy').style.width = `${pet.happiness}%`;
    document.getElementById('val-energy').textContent = `${pet.energy}%`;
    document.getElementById('bar-energy').style.width = `${pet.energy}%`;
    document.getElementById('val-health').textContent = `${pet.health}%`;
    document.getElementById('bar-health').style.width = `${pet.health}%`;
  }

  renderTimer(timer) {
    if (!timer) return;
    this.timerEngine.syncWithBackend(timer);
    this.updateActiveTaskBanner();
  }

  updateActiveTaskBanner() {
    const titleEl = document.getElementById('banner-task-title');
    const timer = window.stateStore.get('timer');
    const tasks = window.stateStore.get('tasks') || [];

    if (timer && timer.active_task_id && tasks.length > 0) {
      const task = tasks.find(t => t.id === timer.active_task_id);
      if (task) {
        titleEl.textContent = `${task.title} (${task.completed_pomodoros}/${task.estimated_pomodoros} phien)`;
        return;
      }
    }
    titleEl.textContent = 'Chua chon cong viec';
  }

  async patPet() {
    try {
      this.petRenderer.spawnHeartParticles();
      const pet = await window.apiClient.post('/api/pet/pat');
      window.stateStore.set('pet', pet);
      this.app.showToast('Ban da vuot ve thu cung (+5 Vui ve)');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async quickFeed() {
    const profile = window.stateStore.get('profile');
    const foodItem = profile?.inventory?.find(i => i.quantity > 0);
    if (!foodItem) {
      this.app.showToast('Kho het do an roi. Hay vao Cua Hang mua them nhe');
      this.app.switchScreen('shop');
      return;
    }

    try {
      this.petRenderer.spawnHeartParticles();
      const pet = await window.apiClient.post('/api/pet/feed', { item_id: foodItem.item_id });
      window.stateStore.set('pet', pet);
      this.app.syncState();
      this.app.showToast('Thu cung da duoc an no ne');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  openAdoptModal() {
    const modal = document.getElementById('modal-adopt');
    const pet = window.stateStore.get('pet');
    document.querySelectorAll('.species-card').forEach(c => {
      c.classList.toggle('active', c.dataset.species === pet?.species);
    });
    document.getElementById('input-adopt-name').value = pet?.name || 'Mochi';
    modal.classList.add('active');
  }

  async adoptPet(species, name) {
    try {
      const pet = await window.apiClient.post('/api/pet/adopt', { species, name });
      window.stateStore.set('pet', pet);
      document.getElementById('modal-adopt').classList.remove('active');
      this.app.showToast(`Chao mung ban moi: ${pet.name}`);
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async renamePet(name) {
    const pet = window.stateStore.get('pet');
    if (!pet) return;
    try {
      const updated = await window.apiClient.post('/api/pet/adopt', { species: pet.species, name });
      window.stateStore.set('pet', updated);
      this.app.showToast(`Da doi ten thanh ${name}`);
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async saveTimerSettings() {
    const focusM = parseInt(document.getElementById('setting-focus-mins').value) || 25;
    const shortM = parseInt(document.getElementById('setting-short-mins').value) || 5;
    const longM = parseInt(document.getElementById('setting-long-mins').value) || 15;
    const interval = parseInt(document.getElementById('setting-long-interval').value) || 4;

    try {
      const timerState = await window.apiClient.post('/api/pomodoro/settings', {
        focus_minutes: focusM,
        short_break_minutes: shortM,
        long_break_minutes: longM,
        long_break_interval: interval
      });
      window.stateStore.set('timer', timerState);
      document.getElementById('modal-settings').classList.remove('active');
      this.app.showToast('Da luu cai dat Pomodoro');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }
}

window.TimerScreen = TimerScreen;
