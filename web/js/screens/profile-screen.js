/* ==========================================================================
   POMOPET MOBILE - Profile & Stats Screen Component
   Zero Emoji, Clean Vector Layout
   ========================================================================== */

class ProfileScreen {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('screen-profile');
    this.questsListEl = document.getElementById('quests-list-container');
    this.historyListEl = document.getElementById('history-timeline');
    this.init();
  }

  init() {
    this.bindEvents();
    window.stateStore.subscribe('profile', (p) => this.renderProfile(p));
    window.stateStore.subscribe('history', (h) => this.renderHistory(h));
    window.stateStore.subscribe('user', (u) => {
      const badge = document.getElementById('profile-user-badge');
      if (badge && u) badge.textContent = `Tai khoan: ${u.username}`;
    });
  }

  bindEvents() {
    const copyBtn = document.getElementById('btn-copy-wifi-url');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.app.vibrate(15);
        const url = this.app.mobileInfo.mobile_url;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            this.app.showToast('Da sao chep dia chi Wi-Fi');
          });
        }
      });
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Ban co chac muon dang xuat khong?')) {
          this.app.logout();
        }
      });
    }

    if (this.questsListEl) {
      this.questsListEl.addEventListener('click', (e) => {
        const claimBtn = e.target.closest('.btn-claim-quest');
        if (claimBtn) {
          const questId = claimBtn.dataset.questId;
          this.claimQuest(questId);
        }
      });
    }
  }

  renderProfile(profile) {
    if (!profile) return;

    document.getElementById('stat-total-mins').textContent = profile.total_focus_minutes || 0;
    document.getElementById('stat-total-pomos').textContent = profile.total_sessions_completed || 0;
    document.getElementById('stat-streak-days').textContent = profile.streak_days || 1;

    const pet = window.stateStore.get('pet');
    if (pet) {
      document.getElementById('stat-pet-level').textContent = pet.level;
    }

    // Daily Quests
    const quests = profile.daily_quests || [];
    if (this.questsListEl) {
      if (quests.length === 0) {
        this.questsListEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 10px;">Chua co nhiem vu hom nay.</div>`;
      } else {
        this.questsListEl.innerHTML = quests.map(q => {
          const isComplete = q.current >= q.target;
          return `
            <div class="m-quest-row">
              <div class="m-quest-info">
                <div class="m-quest-title">${this.app.escape(q.title)} (${q.current}/${q.target})</div>
                <div class="m-quest-reward">+${q.reward_coins} Xu, +${q.reward_exp} EXP</div>
              </div>
              <div>
                ${q.is_claimed ? `
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Da nhan</span>
                ` : isComplete ? `
                  <button class="btn-m-primary btn-m-sm btn-claim-quest" data-quest-id="${q.id}">Nhan Thuong</button>
                ` : `
                  <span style="font-size: 0.75rem; color: var(--text-secondary);">${q.current}/${q.target}</span>
                `}
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  renderHistory(history) {
    if (!this.historyListEl) return;
    if (!history || history.length === 0) {
      this.historyListEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 14px;">
          Chua co lich su phien hoc nao.
        </div>
      `;
      return;
    }

    this.historyListEl.innerHTML = history.slice(0, 10).map(item => {
      const modeLabel = item.mode === 'focus' ? 'Tap trung' : 'Nghi ngoi';
      const timeStr = item.completed_at ? new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 6px; font-size: 0.78rem;">
          <div>
            <span style="font-weight: 700; color: ${item.mode === 'focus' ? '#ff7675' : '#38bdf8'};">[${modeLabel}]</span>
            <span style="color: var(--text-secondary); margin-left: 6px;">${item.duration_minutes} phut</span>
          </div>
          <div style="color: var(--text-muted); font-size: 0.72rem;">${timeStr}</div>
        </div>
      `;
    }).join('');
  }

  async claimQuest(questId) {
    try {
      this.app.vibrate([40, 40, 80]);
      const res = await window.apiClient.post('/api/quests/claim', { quest_id: questId });
      this.app.showToast(`Da nhan thuong: +${res.reward_coins} Xu, +${res.reward_exp} EXP`);
      await this.app.syncState();
    } catch(e) {
      this.app.showToast(e.message);
    }
  }
}

window.ProfileScreen = ProfileScreen;
