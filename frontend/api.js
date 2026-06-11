// ============================================================
// Kishan Sathi — Frontend API Client
// Automatically detects if backend is running, falls back to localStorage
// Include this in pages that use dynamic data: chat, store, my-areastore
// ============================================================

const KisanAPI = (() => {
  const BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3000/api`
    : '/api';

  let backendAvailable = null;

  async function checkBackend() {
    if (backendAvailable !== null) return backendAvailable;
    try {
      const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2000) });
      backendAvailable = res.ok;
    } catch {
      backendAvailable = false;
    }
    return backendAvailable;
  }

  async function request(method, endpoint, body = null, isFormData = false) {
    const token = localStorage.getItem('ks_token');
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const opts = {
      method,
      headers,
    };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);
    const res  = await fetch(`${BASE}${endpoint}`, opts);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'API error');
    return data;
  }

  // ── Forum ──
  const forum = {
    async getPosts(params = {}) {
      const online = await checkBackend();
      if (!online) return { posts: _localForum.getPosts(params) };
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/forum/posts${qs ? '?' + qs : ''}`);
    },
    async createPost(post) {
      const online = await checkBackend();
      if (!online) return { post: _localForum.createPost(post) };
      return request('POST', '/forum/posts', post);
    },
    async toggleLike(postId) {
      const online = await checkBackend();
      if (!online) return _localForum.toggleLike(postId);
      return request('POST', `/forum/posts/${postId}/like`);
    },
    async addComment(postId, commentData) {
      const online = await checkBackend();
      if (!online) return _localForum.addComment(postId, commentData);
      return request('POST', `/forum/posts/${postId}/comment`, commentData);
    },
    async getStats() {
      const online = await checkBackend();
      if (!online) return _localForum.getStats();
      return request('GET', '/forum/stats');
    }
  };

  // ── Local Stores ──
  const stores = {
    async getAll(district) {
      const online = await checkBackend();
      if (!online) return { stores: _localStores.getAll() };
      const qs = district ? `?district=${encodeURIComponent(district)}` : '';
      return request('GET', `/stores${qs}`);
    },
    async create(formData) {
      const online = await checkBackend();
      if (!online) return { store: _localStores.create(Object.fromEntries(formData)) };
      return request('POST', '/stores', formData, true);
    },
    async delete(id) {
      const online = await checkBackend();
      if (!online) { _localStores.delete(id); return { success: true }; }
      return request('DELETE', `/stores/${id}`);
    }
  };

  // ── Orders ──
  const orders = {
    async place(order) {
      const online = await checkBackend();
      if (!online) return { orderId: Date.now(), success: true };
      return request('POST', '/orders', order);
    }
  };

  // ── Ploughing ──
  const ploughing = {
    async getAll(district) {
      const online = await checkBackend();
      if (!online) return { services: _localPloughing.getAll() };
      const qs = district ? `?district=${encodeURIComponent(district)}` : '';
      return request('GET', `/ploughing${qs}`);
    },
    async create(service) {
      const online = await checkBackend();
      if (!online) return { service: _localPloughing.create(service) };
      return request('POST', '/ploughing', service);
    },
    async delete(id) {
      const online = await checkBackend();
      if (!online) { _localPloughing.delete(id); return { success: true }; }
      return request('DELETE', `/ploughing/${id}`);
    }
  };

  // ── Notifications ──
  const notifications = {
    async getAll() {
      const online = await checkBackend();
      if (!online) return { notifications: _localNotifications.getAll() };
      return request('GET', '/notifications');
    },
    async refresh() {
      const online = await checkBackend();
      if (!online) {
        const userStr = localStorage.getItem('ks_user');
        const user = userStr ? JSON.parse(userStr) : null;
        return { notifications: _localNotifications.refresh(user ? user.district : null) };
      }
      return request('POST', '/notifications/refresh');
    },
    async markAllRead() {
      const online = await checkBackend();
      if (!online) { _localNotifications.markAllRead(); return { success: true }; }
      return request('PATCH', '/notifications/read');
    },
    async markRead(id) {
      const online = await checkBackend();
      if (!online) { _localNotifications.markRead(id); return { success: true }; }
      return request('PATCH', `/notifications/${id}/read`);
    }
  };

  // ── localStorage fallbacks ──
  const _localForum = {
    _get() { return JSON.parse(localStorage.getItem('ks_forum_posts') || '[]'); },
    _save(p) { localStorage.setItem('ks_forum_posts', JSON.stringify(p)); },
    getPosts({ topic, search, sort } = {}) {
      let posts = this._get();
      if (topic)  posts = posts.filter(p => p.topic === topic);
      if (search) posts = posts.filter(p => [p.title,p.message,p.user].join(' ').toLowerCase().includes(search.toLowerCase()));
      if (sort === 'popular') posts = [...posts].sort((a,b) => b.likes - a.likes);
      return posts;
    },
    createPost({ user='Anonymous Farmer', title, message, topic='General' }) {
      const posts = this._get();
      const post = { id: Date.now(), user, title, message, topic, likes: 0, created_at: new Date().toISOString() };
      posts.unshift(post);
      this._save(posts);
      return post;
    },
    toggleLike(id) {
      const liked = JSON.parse(localStorage.getItem('ks_liked_posts') || '[]');
      const posts = this._get();
      const post  = posts.find(p => p.id === id);
      if (!post) return { action: 'error' };
      let action;
      if (liked.includes(id)) { post.likes = Math.max(0, post.likes - 1); liked.splice(liked.indexOf(id), 1); action = 'unliked'; }
      else { post.likes++; liked.push(id); action = 'liked'; }
      localStorage.setItem('ks_liked_posts', JSON.stringify(liked));
      this._save(posts);
      return { action };
    },
    addComment(id, { user, message }) {
      const posts = this._get();
      const post = posts.find(p => p.id === id);
      if (!post) return { success: false };
      post.comments = post.comments || [];
      post.comments.push({
        user: user || 'Anonymous Farmer',
        message,
        createdAt: new Date().toISOString()
      });
      this._save(posts);
      return { success: true, comments: post.comments };
    },
    getStats() {
      const posts = this._get();
      return { total: posts.length, users: [...new Set(posts.map(p=>p.user))].length, totalLikes: posts.reduce((s,p)=>s+(p.likes||0),0) };
    }
  };

  const _localStores = {
    _get() { return JSON.parse(localStorage.getItem('ks_local_stores') || '[]'); },
    _save(s) { localStorage.setItem('ks_local_stores', JSON.stringify(s)); },
    getAll() { return this._get(); },
    create({ name, address, phone, category, mapLink, image }) {
      const stores = this._get();
      const store = { id: Date.now(), name, address, phone, category, map_link: mapLink, image_path: image, created_at: new Date().toISOString() };
      stores.unshift(store);
      this._save(stores);
      return store;
    },
    delete(id) { const s = this._get().filter(x => x.id !== id); this._save(s); }
  };

  const _localPloughing = {
    _get() { return JSON.parse(localStorage.getItem('ks_ploughing_services') || '[]'); },
    _save(s) { localStorage.setItem('ks_ploughing_services', JSON.stringify(s)); },
    getAll() { return this._get(); },
    create({ providerName, phone, district, village, rates, tractorDetails }) {
      const services = this._get();
      const keys = Object.keys(rates || {});
      const values = Object.values(rates || {});
      const minRate = Math.min(...values);
      const service = {
        id: Date.now(),
        providerName,
        phone,
        district,
        village,
        rates,
        equipment: keys,
        rate: isFinite(minRate) ? minRate : 0,
        tractorDetails: tractorDetails || null,
        created_at: new Date().toISOString()
      };
      services.unshift(service);
      this._save(services);
      return service;
    },
    delete(id) {
      const s = this._get().filter(x => String(x.id) !== String(id));
      this._save(s);
    }
  };

  const _localNotifications = {
    _get() { return JSON.parse(localStorage.getItem('ks_notifications') || '[]'); },
    _save(n) { localStorage.setItem('ks_notifications', JSON.stringify(n)); },
    getAll() { return this._get(); },
    refresh(district) {
      if (!district) return this._get();
      const notifications = this._get();
      const dateString = new Date().toISOString().split('T')[0];
      const firstLetter = district.charAt(0).toUpperCase();
      let alert = null;
      if (["A", "L", "V", "F", "G"].includes(firstLetter)) {
        alert = { titleKey: "alert_rain_title", messageKey: "alert_rain_msg" };
      } else if (["K", "M", "S", "B", "C"].includes(firstLetter)) {
        alert = { titleKey: "alert_heat_title", messageKey: "alert_heat_msg" };
      } else {
        alert = { titleKey: "alert_wind_title", messageKey: "alert_wind_msg" };
      }
      if (alert) {
        const exists = notifications.some(n => n.titleKey === alert.titleKey && n.dateString === dateString);
        if (!exists) {
          notifications.unshift({
            _id: `local_${Date.now()}`,
            userId: 'local',
            titleKey: alert.titleKey,
            messageKey: alert.messageKey,
            type: 'weather_alert',
            read: false,
            district,
            dateString,
            createdAt: new Date().toISOString()
          });
          this._save(notifications);
        }
      }
      return this._get();
    },
    markAllRead() {
      const n = this._get().map(x => ({ ...x, read: true }));
      this._save(n);
    },
    markRead(id) {
      const n = this._get().map(x => String(x._id) === String(id) ? { ...x, read: true } : x);
      this._save(n);
    }
  };

  return { forum, stores, orders, ploughing, notifications, checkBackend };
})();
