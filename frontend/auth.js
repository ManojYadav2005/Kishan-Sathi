const Auth = (() => {
  const BASE = 'http://localhost:3000/api/auth';

  function getToken() { return localStorage.getItem('ks_token'); }
  function getUser() { try { return JSON.parse(localStorage.getItem('ks_user') || 'null'); } catch { return null; } }

  function setSession(token, user) {
    localStorage.setItem('ks_token', token);
    localStorage.setItem('ks_user', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('ks_token');
    localStorage.removeItem('ks_user');
  }

  function isLoggedIn() { return !!getToken(); }
  function headers() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

  async function register(args) {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setSession(data.token, data.user);
    return data.user;
  }

  async function login(args) {
    const res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setSession(data.token, data.user);
    return data.user;
  }

  async function fetchMe() {
    if (!getToken()) return null;
    const res = await fetch(`${BASE}/me`, { headers: headers() });
    const data = await res.json();
    if (!data.success) { clearSession(); return null; }
    localStorage.setItem('ks_user', JSON.stringify(data.user));
    return data.user;
  }

  async function updateProfile(formData) {
    const res = await fetch(`${BASE}/profile`, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    localStorage.setItem('ks_user', JSON.stringify(data.user));
    return data.user;
  }

  function logout() {
    if (!confirm(typeof Lang !== 'undefined' ? Lang.t('logout_confirm') : 'Are you sure you want to logout?')) return;
    clearSession();
    window.location.href = 'login.html';
  }

  function requireAuth(redirectTo = 'login.html') {
    if (!isLoggedIn()) { window.location.href = redirectTo; return false; }
    return true;
  }

  function updateNav() {
    const user = getUser();
    const loggedIn = isLoggedIn();

    document.querySelectorAll('.nav-auth-item').forEach((el) => el.remove());

    const authArea = document.querySelector('.nav-auth-area');
    if (!authArea) return;

    if (loggedIn && user) {
      const profileBtn = document.createElement('a');
      profileBtn.className = 'nav-auth-item tts-toggle-btn';
      profileBtn.href = 'profile.html';
      profileBtn.style.cssText = 'background:rgba(255,255,255,.15);border:none;color:white;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:.78rem;font-weight:600;white-space:nowrap;text-decoration:none;display:flex;align-items:center;gap:4px;';
      profileBtn.innerHTML = `👤 ${user.name.split(' ')[0]}`;

      const logoutBtn = document.createElement('a');
      logoutBtn.className = 'nav-auth-item tts-toggle-btn';
      logoutBtn.href = '#';
      logoutBtn.onclick = (e) => { e.preventDefault(); Auth.logout(); };
      logoutBtn.style.cssText = 'background:rgba(255,100,100,.2);border:none;color:white;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:.78rem;font-weight:600;white-space:nowrap;text-decoration:none;display:flex;align-items:center;gap:4px;';
      logoutBtn.innerHTML = `🚪 <span data-i18n="nav_logout">Logout</span>`;

      authArea.appendChild(profileBtn);
      authArea.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement('a');
      loginBtn.className = 'nav-auth-item tts-toggle-btn';
      loginBtn.href = 'login.html';
      loginBtn.style.cssText = 'background:rgba(230,168,23,.25);color:#ffe082;border:none;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:.78rem;font-weight:600;white-space:nowrap;text-decoration:none;display:flex;align-items:center;gap:4px;';
      loginBtn.innerHTML = `🔑 <span data-i18n="nav_login">Login</span>`;

      const regBtn = document.createElement('a');
      regBtn.className = 'nav-auth-item tts-toggle-btn';
      regBtn.href = 'register.html';
      regBtn.style.cssText = 'background:var(--green-600);border:none;color:white;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:.78rem;font-weight:600;white-space:nowrap;text-decoration:none;display:flex;align-items:center;gap:4px;';
      regBtn.innerHTML = `✅ <span data-i18n="nav_register">Register</span>`;

      authArea.appendChild(loginBtn);
      authArea.appendChild(regBtn);
    }

    if (typeof Lang !== 'undefined') Lang.apply(Lang.getCurrent());
    if (typeof initNotifications === 'function') initNotifications();
  }

  return { getToken, getUser, isLoggedIn, headers, register, login, fetchMe, updateProfile, logout, requireAuth, updateNav };
})();
