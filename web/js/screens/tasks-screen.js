/* ==========================================================================
   POMOPET MOBILE - Tasks Screen Component
   Zero Emoji, Clean Vector Layout
   ========================================================================== */

class TasksScreen {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('screen-tasks');
    this.listEl = document.getElementById('tasks-list-container');
    this.init();
  }

  init() {
    this.bindEvents();
    window.stateStore.subscribe('tasks', (tasks) => this.renderTasks(tasks));
  }

  bindEvents() {
    const form = document.getElementById('form-add-task');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddTask();
      });
    }

    if (this.listEl) {
      this.listEl.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.m-task-item');
        if (!itemEl) return;
        const taskId = itemEl.dataset.id;

        // Toggle Done
        if (e.target.closest('.m-task-checkbox')) {
          this.toggleTask(taskId);
          return;
        }

        // Delete
        if (e.target.closest('.btn-task-delete')) {
          this.deleteTask(taskId);
          return;
        }

        // Select as Active Task for Timer
        if (e.target.closest('.btn-task-focus')) {
          this.setTaskAsActive(taskId);
          return;
        }
      });
    }
  }

  renderTasks(tasks) {
    if (!this.listEl) return;
    if (!tasks || tasks.length === 0) {
      this.listEl.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted); font-size: 0.85rem;">
          Chua co cong viec nao. Hay them muc tieu dau tien o tren.
        </div>
      `;
      return;
    }

    const timer = window.stateStore.get('timer');
    const activeTaskId = timer?.active_task_id || '';

    this.listEl.innerHTML = tasks.map(t => `
      <div class="m-task-item ${t.is_completed ? 'completed' : ''} ${t.id === activeTaskId ? 'is-active' : ''}" data-id="${t.id}">
        <div class="m-task-checkbox ${t.is_completed ? 'checked' : ''}" title="${t.is_completed ? 'Danh dau chua xong' : 'Hoan thanh'}">
          ${t.is_completed ? '<svg class="svg-icon-mini" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
        </div>

        <div class="m-task-item-body">
          <div class="m-task-item-title">${this.app.escape(t.title)}</div>
          <div class="m-task-meta-row">
            <span class="m-tag-badge">${this.app.escape(t.tag || 'Khac')}</span>
            <span>Tien do: ${t.completed_pomodoros}/${t.estimated_pomodoros} phien</span>
            ${t.id === activeTaskId ? '<span style="color: #ff5252; font-weight: 700;">[Dang hoc]</span>' : ''}
          </div>
        </div>

        <div class="m-task-item-actions">
          ${!t.is_completed ? `
            <button class="btn-task-action btn-task-focus" title="Gan voi dong ho Pomodoro">
              <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            </button>
          ` : ''}
          <button class="btn-task-action btn-task-delete" title="Xoa cong viec">
            <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  async handleAddTask() {
    const titleInput = document.getElementById('input-task-title');
    const pomoInput = document.getElementById('input-task-pomo');
    const tagInput = document.getElementById('input-task-tag');

    const title = titleInput.value.trim();
    const est = parseInt(pomoInput.value) || 2;
    const tag = tagInput.value;

    if (!title) return;

    try {
      const newTask = await window.apiClient.post('/api/tasks', {
        title: title,
        estimated_pomodoros: est,
        tag: tag
      });

      const currentTasks = window.stateStore.get('tasks') || [];
      window.stateStore.set('tasks', [newTask, ...currentTasks]);

      titleInput.value = '';
      this.app.showToast('Da them cong viec moi');
    } catch (err) {
      this.app.showToast(err.message);
    }
  }

  async toggleTask(taskId) {
    try {
      this.app.vibrate(20);
      const updated = await window.apiClient.post(`/api/tasks/${taskId}/toggle`);
      const tasks = (window.stateStore.get('tasks') || []).map(t => t.id === taskId ? updated : t);
      window.stateStore.set('tasks', tasks);
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async deleteTask(taskId) {
    if (!confirm('Ban co chac chan muon xoa cong viec nay khong?')) return;
    try {
      this.app.vibrate(25);
      await window.apiClient.delete(`/api/tasks/${taskId}`);
      const tasks = (window.stateStore.get('tasks') || []).filter(t => t.id !== taskId);
      window.stateStore.set('tasks', tasks);
      this.app.showToast('Da xoa cong viec');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }

  async setTaskAsActive(taskId) {
    try {
      this.app.vibrate(15);
      const timer = window.stateStore.get('timer') || {};
      const res = await window.apiClient.post('/api/pomodoro/start', {
        mode: timer.mode || 'focus',
        active_task_id: taskId
      });
      window.stateStore.set('timer', res);
      this.app.switchScreen('timer');
      this.app.showToast('Da gan cong viec vao phien tap trung');
    } catch(e) {
      this.app.showToast(e.message);
    }
  }
}

window.TasksScreen = TasksScreen;
