/* ==========================================================================
   POMOPET MOBILE - Reactive State Store (Observer Pattern OOP)
   ========================================================================== */

class StateStore {
  constructor() {
    this.state = {
      user: null,
      pet: null,
      timer: null,
      tasks: [],
      profile: null,
      history: [],
      shopCatalog: [],
      activeScreen: 'timer',
    };
    this.subscribers = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.notify(key, value);
  }

  update(partialState) {
    for (const [k, v] of Object.entries(partialState)) {
      this.state[k] = v;
      this.notify(k, v);
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => {
      this.subscribers.get(key).delete(callback);
    };
  }

  notify(key, value) {
    if (this.subscribers.has(key)) {
      for (const cb of this.subscribers.get(key)) {
        try { cb(value, this.state); } catch(e) { console.error(e); }
      }
    }
    // Global wildcard subscribers
    if (this.subscribers.has('*')) {
      for (const cb of this.subscribers.get('*')) {
        try { cb(key, value, this.state); } catch(e) { console.error(e); }
      }
    }
  }
}

window.stateStore = new StateStore();
