/* ==========================================================================
   POMOPET MOBILE - Inventory Screen Component
   Zero Emoji, Clean Vector Layout
   ========================================================================== */

class InventoryScreen {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('screen-inventory');
    this.foodGrid = document.getElementById('inv-food-grid');
    this.hatsGrid = document.getElementById('inv-hats-grid');
    this.themesGrid = document.getElementById('inv-themes-grid');
    this.init();
  }

  init() {
    this.bindEvents();
    window.stateStore.subscribe('profile', () => this.render());
    window.stateStore.subscribe('pet', () => this.render());
  }

  bindEvents() {
    if (this.foodGrid) {
      this.foodGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.m-inv-card');
        if (card && card.dataset.itemId) {
          this.feedFood(card.dataset.itemId);
        }
      });
    }

    if (this.hatsGrid) {
      this.hatsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.m-inv-card');
        if (card && card.dataset.hatId !== undefined) {
          this.toggleHat(card.dataset.hatId);
        }
      });
    }

    if (this.themesGrid) {
      this.themesGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.m-inv-card');
        if (card && card.dataset.themeId) {
          this.setTheme(card.dataset.themeId);
        }
      });
    }
  }

  render() {
    const profile = window.stateStore.get('profile');
    const pet = window.stateStore.get('pet');
    const catalog = window.stateStore.get('shopCatalog') || [];

    if (!profile) return;

    // 1. Food Grid
    const inv = profile.inventory || [];
    if (this.foodGrid) {
      if (inv.length === 0) {
        this.foodGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 12px;">Chua co thuc an. Hay vao Cua Hang mua nhe.</div>`;
      } else {
        this.foodGrid.innerHTML = inv.map(i => {
          const itemDef = catalog.find(c => c.id === i.item_id);
          const name = itemDef ? itemDef.name : i.item_id;
          return `
            <div class="m-inv-card" data-item-id="${i.item_id}">
              <span class="m-inv-qty">x${i.quantity}</span>
              <div class="m-inv-vector">
                <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
              </div>
              <div class="m-inv-title">${this.app.escape(name)}</div>
              <button class="btn-m-primary btn-m-sm" style="width: 100%; height: 28px; font-size: 0.72rem;">Cho an</button>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Hats Grid
    const unlockedHats = profile.unlocked_hats || [];
    const equippedHat = pet?.equipped_hat || '';
    if (this.hatsGrid) {
      let hatsHtml = `
        <div class="m-inv-card ${equippedHat === '' ? 'equipped' : ''}" data-hat-id="">
          <div class="m-inv-vector">
            <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </div>
          <div class="m-inv-title">Khong doi</div>
          <span style="font-size: 0.7rem; color: #38bdf8;">${equippedHat === '' ? 'Dang dung' : 'Thao ra'}</span>
        </div>
      `;

      unlockedHats.forEach(hId => {
        const itemDef = catalog.find(c => c.id === hId);
        const name = itemDef ? itemDef.name : hId;
        const isEquipped = equippedHat === hId;
        hatsHtml += `
          <div class="m-inv-card ${isEquipped ? 'equipped' : ''}" data-hat-id="${hId}">
            <div class="m-inv-vector">
              <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm0 8.5L4.5 7.5 12 3.8l7.5 3.7L12 10.5z"/></svg>
            </div>
            <div class="m-inv-title">${this.app.escape(name)}</div>
            <span style="font-size: 0.7rem; color: #38bdf8;">${isEquipped ? 'Dang doi' : 'Doi len'}</span>
          </div>
        `;
      });
      this.hatsGrid.innerHTML = hatsHtml;
    }

    // 3. Themes Grid
    const unlockedThemes = profile.unlocked_themes || ['theme_cozy'];
    const activeTheme = pet?.room_theme || 'theme_cozy';
    if (this.themesGrid) {
      this.themesGrid.innerHTML = unlockedThemes.map(tId => {
        const itemDef = catalog.find(c => c.id === tId);
        const name = itemDef ? itemDef.name : tId;
        const isActive = activeTheme === tId;
        return `
          <div class="m-inv-card ${isActive ? 'equipped' : ''}" data-theme-id="${tId}">
            <div class="m-inv-vector">
              <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-4h4v4zm0-6H7V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z"/></svg>
            </div>
            <div class="m-inv-title">${this.app.escape(name)}</div>
            <span style="font-size: 0.7rem; color: #38bdf8;">${isActive ? 'Dang dung' : 'Chon phong'}</span>
          </div>
        `;
      }).join('');
    }
  }

  async feedFood(itemId) {
    try {
      this.app.vibrate(20);
      this.app.petRenderer.spawnHeartParticles();
      const updatedPet = await window.apiClient.post('/api/pet/feed', { item_id: itemId });
      window.stateStore.set('pet', updatedPet);
      await this.app.syncState();
      this.app.showToast('Thu cung da duoc an no ne');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async toggleHat(hatId) {
    try {
      this.app.vibrate(15);
      const updatedPet = await window.apiClient.post('/api/pet/hat', { hat_id: hatId });
      window.stateStore.set('pet', updatedPet);
      this.app.showToast(hatId ? 'Da doi phu kien len dau' : 'Da thao phu kien');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async setTheme(themeId) {
    try {
      this.app.vibrate(15);
      const updatedPet = await window.apiClient.post('/api/pet/theme', { theme_id: themeId });
      window.stateStore.set('pet', updatedPet);
      this.app.showToast('Da doi khong gian phong hoc');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }
}

window.InventoryScreen = InventoryScreen;
