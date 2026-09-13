/* ==========================================================================
   POMOPET MOBILE - Shop Screen Component
   Zero Emoji, Clean Vector Layout
   ========================================================================== */

class ShopScreen {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('screen-shop');
    this.gridEl = document.getElementById('shop-items-grid');
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.bindEvents();
    window.stateStore.subscribe('shopCatalog', (catalog) => this.renderCatalog(catalog));
    window.stateStore.subscribe('profile', () => {
      const catalog = window.stateStore.get('shopCatalog');
      if (catalog) this.renderCatalog(catalog);
    });
  }

  bindEvents() {
    document.querySelectorAll('[data-shop-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.app.vibrate(12);
        document.querySelectorAll('[data-shop-filter]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.shopFilter;
        this.renderCatalog(window.stateStore.get('shopCatalog'));
      });
    });

    if (this.gridEl) {
      this.gridEl.addEventListener('click', (e) => {
        const buyBtn = e.target.closest('.btn-shop-buy');
        if (buyBtn) {
          const itemId = buyBtn.dataset.itemId;
          this.buyItem(itemId);
        }
      });
    }
  }

  renderCatalog(catalog) {
    if (!this.gridEl) return;
    if (!catalog || catalog.length === 0) {
      this.gridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.85rem;">
          Dang tai danh muc vat pham...
        </div>
      `;
      return;
    }

    const profile = window.stateStore.get('profile') || {};
    const unlockedHats = profile.unlocked_hats || [];
    const unlockedThemes = profile.unlocked_themes || [];

    const filtered = catalog.filter(it => {
      if (this.currentFilter === 'all') return true;
      return it.category === this.currentFilter;
    });

    this.gridEl.innerHTML = filtered.map(it => {
      const isOwned = (it.category === 'hat' && unlockedHats.includes(it.id)) ||
                      (it.category === 'theme' && unlockedThemes.includes(it.id));

      return `
        <div class="m-shop-card" data-id="${it.id}">
          <div class="m-shop-vector-box">
            <svg class="svg-icon" style="width: 24px; height: 24px;" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/></svg>
          </div>
          <div class="m-shop-name">${this.app.escape(it.name)}</div>
          <div class="m-shop-desc">${this.app.escape(it.description)}</div>
          <div class="m-shop-footer">
            <div class="m-shop-price">
              <svg class="svg-icon-mini" style="color: #fbbf24;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <span>${it.price} Xu</span>
            </div>
            ${isOwned ? `
              <button class="btn-m-secondary btn-m-sm" disabled style="opacity: 0.5;">Da co</button>
            ` : `
              <button class="btn-m-primary btn-m-sm btn-shop-buy" data-item-id="${it.id}">Mua</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  async buyItem(itemId) {
    try {
      this.app.vibrate(25);
      const updatedProfile = await window.apiClient.post('/api/shop/buy', { item_id: itemId });
      window.stateStore.set('profile', updatedProfile);
      this.app.showToast('Mua vat pham thanh cong');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }
}

window.ShopScreen = ShopScreen;
