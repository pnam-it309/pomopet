/* ==========================================================================
   POMOPET MOBILE - Auth Screen Component
   Zero Emoji, Clean Vector Layout
   ========================================================================== */

class AuthScreen {
  constructor(app) {
    this.app = app;
    this.isRegisterMode = false;
    this.selectedSpecies = 'cat';
    this.container = document.getElementById('screen-auth');
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="m-auth-wrapper">
        <div class="m-auth-hero">
          <div class="m-auth-icon-badge">
            <svg class="svg-icon" style="width: 32px; height: 32px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <h2 class="m-auth-title">PomoPet Mobile</h2>
          <p class="m-auth-sub">${this.isRegisterMode ? 'Tao tai khoan & chon thu cung dong hanh' : 'Dang nhap vao khong gian hoc tap cua ban'}</p>
        </div>

        <div class="m-auth-card">
          <div class="m-auth-tabs">
            <button type="button" class="m-auth-tab ${!this.isRegisterMode ? 'active' : ''}" id="tab-login">Dang Nhap</button>
            <button type="button" class="m-auth-tab ${this.isRegisterMode ? 'active' : ''}" id="tab-register">Dang Ky</button>
          </div>

          <form id="form-auth" class="m-auth-form">
            <div class="m-form-group">
              <label>Ten dang nhap</label>
              <input type="text" id="auth-username" class="m-auth-input" placeholder="Nhap ten dang nhap..." required autocomplete="username">
            </div>

            <div class="m-form-group">
              <label>Mat khau</label>
              <input type="password" id="auth-password" class="m-auth-input" placeholder="Nhap mat khau (it nhat 6 ky tu)..." required autocomplete="current-password">
            </div>

            ${this.isRegisterMode ? `
              <div class="m-form-group">
                <label>Ten hien thi (Biet danh)</label>
                <input type="text" id="auth-display-name" class="m-auth-input" placeholder="Biet danh cua ban...">
              </div>

              <div class="m-form-group">
                <label class="m-pet-selector-label">Chon thu cung khoi dau:</label>
                <div class="m-starter-pets">
                  <div class="m-starter-card ${this.selectedSpecies === 'cat' ? 'active' : ''}" data-species="cat">
                    <div class="name">Meo</div>
                  </div>
                  <div class="m-starter-card ${this.selectedSpecies === 'dragon' ? 'active' : ''}" data-species="dragon">
                    <div class="name">Rong</div>
                  </div>
                  <div class="m-starter-card ${this.selectedSpecies === 'sprout' ? 'active' : ''}" data-species="sprout">
                    <div class="name">Mam</div>
                  </div>
                  <div class="m-starter-card ${this.selectedSpecies === 'penguin' ? 'active' : ''}" data-species="penguin">
                    <div class="name">Canh Cut</div>
                  </div>
                </div>
              </div>
            ` : ''}

            <button type="submit" class="btn-m-primary btn-m-huge" style="width: 100%; margin-top: 6px;">
              ${this.isRegisterMode ? 'Tao Tai Khoan' : 'Dang Nhap'}
            </button>
          </form>

          ${!this.isRegisterMode ? `
            <div class="m-auth-quick-demo">
              <button type="button" id="btn-demo-login" class="btn-demo-quick">
                Dang nhap nhanh tai khoan Demo (1-Click)
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'tab-login' || e.target.id === 'tab-register')) {
        this.isRegisterMode = (e.target.id === 'tab-register');
        this.render();
        return;
      }

      if (e.target && e.target.id === 'btn-demo-login') {
        document.getElementById('auth-username').value = 'demo';
        document.getElementById('auth-password').value = '123456';
        this.handleAuthSubmit();
        return;
      }

      const starterCard = e.target.closest('.m-starter-card');
      if (starterCard) {
        this.selectedSpecies = starterCard.dataset.species;
        this.container.querySelectorAll('.m-starter-card').forEach(c => c.classList.remove('active'));
        starterCard.classList.add('active');
      }
    });

    this.container.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'form-auth') {
        e.preventDefault();
        this.handleAuthSubmit();
      }
    });
  }

  async handleAuthSubmit() {
    const u = document.getElementById('auth-username').value.trim();
    const p = document.getElementById('auth-password').value.trim();

    if (!u || !p) {
      this.app.showToast('Vui long dien day du ten va mat khau');
      return;
    }

    try {
      if (this.isRegisterMode) {
        const dn = (document.getElementById('auth-display-name')?.value || u).trim();
        const res = await window.apiClient.post('/api/auth/register', {
          username: u,
          password: p,
          display_name: dn,
          initial_species: this.selectedSpecies
        });
        window.apiClient.setToken(res.token);
        window.stateStore.set('user', res.user);
        this.app.showToast('Dang ky thanh cong! Chao mung ban');
      } else {
        const res = await window.apiClient.post('/api/auth/login', {
          username: u,
          password: p
        });
        window.apiClient.setToken(res.token);
        window.stateStore.set('user', res.user);
        this.app.showToast('Dang nhap thanh cong');
      }

      this.app.onLoginSuccess();
    } catch (err) {
      this.app.showToast(err.message || 'Xac thuc that bai');
    }
  }
}

window.AuthScreen = AuthScreen;
