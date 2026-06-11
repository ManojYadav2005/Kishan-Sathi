// ============================================================
// Kishan Sathi — Shared Nav & Footer Injector v2
// Include this FIRST, then i18n.js, then auth.js
// ============================================================
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';

  const navItems = [
    { href:'index.html',           icon:'🏠', key:'nav_home',      label:'Home' },
    { href:'crop-planner.html',    icon:'🗓️', key:'nav_crop',      label:'Crop Planner' },
    { href:'weather.html',         icon:'🌦️', key:'nav_weather',   label:'Weather' },
    { href:'market-price.html',    icon:'💹', key:'nav_market',    label:'Market Prices' },
    { href:'education.html',       icon:'📚', key:'nav_education', label:'Education Hub' },
    { href:'chat.html',            icon:'💬', key:'nav_community', label:'Community' },
    { href:'store.html',           icon:'🛒', key:'nav_store',     label:'Agri Store' },
    { href:'comparison.html',      icon:'⚖️', key:'nav_compare',   label:'Organic vs Chemical' },
    { href:'loan-calculator.html', icon:'💰', key:'nav_loan',      label:'Loan Calculator' },
    { href:'ploughing-services.html', icon:'🚜', key:'nav_ploughing', label:'Ploughing Services' },
  ];

  // Secondary/deeper items go in top nav; primary quick-access in bottom dock
  const topNavItems = navItems.filter(n => !['nav_home', 'nav_crop', 'nav_weather', 'nav_market'].includes(n.key));
  const headerHTML = `
<header class="site-header" id="site-header">
  <a href="index.html" class="site-logo">
    <div class="logo-icon">🚜</div>
    <div>
      <div class="logo-text">Kishan Sathi</div>
      <div class="logo-sub">किसान साथी</div>
    </div>
  </a>
  <button class="nav-toggle" onclick="toggleNav()" aria-label="Menu">☰</button>
  <nav class="site-nav" id="site-nav">
    <ul class="nav-list">
      ${topNavItems.map(n => `
        <li><a href="${n.href}" class="${page===n.href?'active':''}">  ${n.icon} <span data-i18n="${n.key}">${n.label}</span></a></li>
      `).join('')}
    </ul>
  </nav>

  <!-- Auth Action Buttons (separate from nav-list) -->
  <div class="nav-auth-area" id="nav-auth-area" style="display:flex;align-items:center;gap:8px;flex-shrink:0;"></div>

  <!-- Notification Bell -->
  <div class="noti-bell-wrap" id="noti-bell-wrap" style="position:relative;margin-right:8px;display:none;align-items:center;">
    <button class="noti-bell-btn" onclick="toggleNotiDropdown()" style="background:none;border:none;font-size:1.35rem;cursor:pointer;position:relative;padding:4px;color:white;display:flex;align-items:center;justify-content:center;" aria-label="Notifications">
      🔔
      <span class="noti-badge" id="noti-badge" style="position:absolute;top:-2px;right:-2px;background:#e63946;color:white;font-size:0.68rem;font-weight:bold;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--green-900);box-shadow:0 2px 4px rgba(0,0,0,0.2);display:none;">0</span>
    </button>
    <div class="noti-dropdown" id="noti-dropdown" style="display:none;position:absolute;top:45px;right:0;width:340px;background:rgba(255,255,255,0.98);backdrop-filter:blur(10px);border:1.5px solid var(--neutral-200);border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.15);padding:16px;z-index:9999;color:var(--neutral-800);font-family:var(--font-body);animation: fadeUp .2s ease;text-align:left;">
      <div class="noti-header" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--neutral-200);padding-bottom:10px;margin-bottom:10px;">
        <h4 style="margin:0;font-size:0.95rem;color:var(--green-800);font-weight:700;" data-i18n="noti_center_title">Notifications Center</h4>
        <button onclick="markAllRead()" style="background:none;border:none;color:var(--green-600);font-size:0.75rem;cursor:pointer;font-weight:600;padding:0;" data-i18n="mark_all_read">Mark all as read</button>
      </div>
      <div id="noti-list" style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
        <div style="text-align:center;color:var(--neutral-400);font-size:0.85rem;padding:20px 0;" data-i18n="no_notifications">No new alerts</div>
      </div>
      <div class="noti-footer" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--neutral-200);display:flex;justify-content:center;">
        <button class="btn btn-secondary btn-sm" id="btn-noti-perm" onclick="requestNotificationPermission()" style="font-size:0.75rem;padding:6px 12px;width:100%;" data-i18n="enable_alerts_btn">Enable Browser Alerts</button>
      </div>
    </div>
  </div>

  <!-- TTS Toggle Button -->
  <button class="tts-toggle-btn" id="tts-toggle-btn" onclick="toggleReadAloud()" title="Read Page Aloud"
    style="background:rgba(255,255,255,.15);border:none;color:white;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:.78rem;font-weight:600;white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:4px;">
    🔊 <span data-i18n="listen_page">Listen</span>
  </button>

  <button class="lang-toggle-btn" onclick="toggleLang()" title="Switch Language"
    style="background:rgba(255,255,255,.15);border:none;color:white;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:.78rem;font-weight:600;white-space:nowrap;flex-shrink:0;">
    हिंदी में
  </button>
</header>`;


  const footerHTML = `
<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-col">
      <h4>🚜 Kishan Sathi</h4>
      <p style="font-size:.9rem;line-height:1.7;color:#80c99e;">
        Empowering Indian farmers with smart digital tools for better yields, prices, and planning.
      </p>
    </div>
    <div class="footer-col">
      <h4>Quick Links</h4>
      <ul>
        ${navItems.map(n=>`<li><a href="${n.href}">${n.icon} <span data-i18n="${n.key}">${n.label}</span></a></li>`).join('')}
        <li><a href="login.html">🔑 <span data-i18n="nav_login">Login</span></a></li>
        <li><a href="register.html">✅ <span data-i18n="nav_register">Register</span></a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Government Portals</h4>
      <ul>
        <li><a href="https://pmkisan.gov.in" target="_blank">PM-Kisan</a></li>
        <li><a href="https://pmfby.gov.in" target="_blank">PM Fasal Bima</a></li>
        <li><a href="https://enam.gov.in" target="_blank">eNAM</a></li>
        <li><a href="https://agmarknet.gov.in" target="_blank">Agmarknet</a></li>
        <li><a href="https://soilhealth.dac.gov.in" target="_blank">Soil Health Card</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Helplines</h4>
      <ul>
        <li><a href="tel:1800-180-1551">Kisan Call: 1800-180-1551</a></li>
        <li><a href="tel:1551">Agri Helpline: 1551</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">&copy; 2025 Kishan Sathi — Empowering Indian Farmers</div>
</footer>`;

  const bottomNavHTML = `
  <nav class="bottom-nav">
    <a href="index.html" class="bottom-nav-item ${page==='index.html'?'active':''}">
      <span class="icon">🏠</span>
      <span class="label" data-i18n="nav_home">Home</span>
    </a>
    <a href="crop-planner.html" class="bottom-nav-item ${page==='crop-planner.html'?'active':''}">
      <span class="icon">🗓️</span>
      <span class="label" data-i18n="nav_crop">Planner</span>
    </a>
    <a href="weather.html" class="bottom-nav-item ${page==='weather.html'?'active':''}">
      <span class="icon">🌦️</span>
      <span class="label" data-i18n="nav_weather">Weather</span>
    </a>
    <a href="market-price.html" class="bottom-nav-item ${page==='market-price.html'?'active':''}">
      <span class="icon">💹</span>
      <span class="label" data-i18n="nav_market">Mandi</span>
    </a>
    <a href="store.html" class="bottom-nav-item ${page==='store.html'?'active':''}">
      <span class="icon">🛒</span>
      <span class="label" data-i18n="nav_store">Store</span>
    </a>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
  document.body.insertAdjacentHTML('beforeend', bottomNavHTML);

  setTimeout(() => {
    if (typeof initNotifications === 'function') initNotifications();
  }, 100);
})();

function toggleNav() {
  document.getElementById('site-nav').classList.toggle('open');
}

function toggleLang() {
  const current = (typeof Lang !== 'undefined') ? Lang.getCurrent() : (localStorage.getItem('ks_lang') || 'en');
  const next    = current === 'en' ? 'hi' : 'en';
  if (typeof Lang !== 'undefined') Lang.set(next);
  else localStorage.setItem('ks_lang', next);
  if (typeof Auth !== 'undefined') Auth.updateNav();
}

let notificationsList = [];

async function initNotifications() {
  const bellWrap = document.getElementById('noti-bell-wrap');
  if (!bellWrap) return;

  const loggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();
  if (!loggedIn) {
    bellWrap.style.display = 'none';
    return;
  }
  
  bellWrap.style.display = 'flex';
  updateNotiPermissionBtn();

  try {
    const res = await KisanAPI.notifications.refresh();
    notificationsList = res.notifications || [];
    renderNotifications();
  } catch (err) {
    console.error("Failed to load notifications:", err);
  }
}

function updateNotiPermissionBtn() {
  const permBtn = document.getElementById('btn-noti-perm');
  if (!permBtn) return;
  
  if (typeof Notification === 'undefined') {
    permBtn.style.display = 'none';
    return;
  }

  if (Notification.permission === 'granted') {
    permBtn.style.display = 'none';
  } else {
    permBtn.style.display = 'block';
    permBtn.textContent = typeof Lang !== 'undefined' ? Lang.t('enable_alerts_btn') : 'Enable Browser Alerts';
  }
}

async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return;
  
  const permission = await Notification.requestPermission();
  updateNotiPermissionBtn();
  if (permission === 'granted') {
    new Notification("Kishan Sathi", {
      body: typeof Lang !== 'undefined' && Lang.getCurrent() === 'hi'
        ? "अलर्ट सफलतापूर्वक सक्रिय हो गए हैं!"
        : "Alerts successfully enabled!",
      icon: "favicon.ico"
    });
  }
}

function toggleNotiDropdown() {
  const dropdown = document.getElementById('noti-dropdown');
  if (!dropdown) return;
  const isHidden = dropdown.style.display === 'none';
  dropdown.style.display = isHidden ? 'block' : 'none';
  
  if (isHidden) {
    const clickOutside = (e) => {
      const bell = document.getElementById('noti-bell-wrap');
      if (bell && !bell.contains(e.target)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', clickOutside);
      }
    };
    setTimeout(() => document.addEventListener('click', clickOutside), 10);
  }
}

function renderNotifications() {
  const list = document.getElementById('noti-list');
  const badge = document.getElementById('noti-badge');
  if (!list || !badge) return;

  const unread = notificationsList.filter(n => !n.read);
  if (unread.length > 0) {
    badge.textContent = unread.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }

  if (notificationsList.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;color:var(--neutral-400);font-size:0.85rem;padding:20px 0;" data-i18n="no_notifications">
        ${typeof Lang !== 'undefined' ? Lang.t('no_notifications') : 'No new alerts'}
      </div>
    `;
    return;
  }

  const newest = notificationsList[0];
  if (newest && !newest.read) {
    const lastSeen = localStorage.getItem('ks_last_seen_noti');
    const newId = String(newest._id || newest.id);
    if (lastSeen !== newId) {
      localStorage.setItem('ks_last_seen_noti', newId);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const titleText = typeof Lang !== 'undefined' ? Lang.t(newest.titleKey) : newest.titleKey;
        const msgText = typeof Lang !== 'undefined' ? Lang.t(newest.messageKey) : newest.messageKey;
        new Notification(titleText, {
          body: msgText,
          icon: 'favicon.ico'
        });
      }
    }
  }

  list.innerHTML = notificationsList.map(n => {
    const titleText = typeof Lang !== 'undefined' ? Lang.t(n.titleKey) : n.titleKey;
    const msgText = typeof Lang !== 'undefined' ? Lang.t(n.messageKey) : n.messageKey;
    const dt = new Date(n.createdAt);
    const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sId = n._id || n.id;
    
    return `
      <div onclick="markRead('${sId}')" class="noti-item ${n.read ? '' : 'unread'}" 
        style="padding:10px 12px; border-radius:8px; border-left: 4px solid ${n.read ? 'transparent' : 'var(--green-600)'}; 
        background:${n.read ? 'var(--neutral-50)' : 'var(--green-50)'}; cursor:pointer; transition:var(--transition); display:flex; flex-direction:column; gap:4px; text-align:left;">
        <div style="font-weight:700; font-size:0.85rem; color:var(--neutral-800); display:flex; justify-content:space-between; align-items:center;">
          <span>${titleText}</span>
          <span style="font-size:0.7rem; font-weight:500; color:var(--neutral-400);">${timeStr}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--neutral-600); line-height:1.4;">${msgText}</div>
      </div>
    `;
  }).join('');
  
  if (typeof Lang !== 'undefined') Lang.apply(Lang.getCurrent());
}

async function markRead(id) {
  try {
    await KisanAPI.notifications.markRead(id);
    const item = notificationsList.find(n => String(n._id || n.id) === String(id));
    if (item) item.read = true;
    renderNotifications();
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

async function markAllRead() {
  try {
    await KisanAPI.notifications.markAllRead();
    notificationsList = notificationsList.map(n => ({ ...n, read: true }));
    renderNotifications();
  } catch (err) {
    console.error("Failed to mark all as read:", err);
  }
}

// ── Text to Speech (Read Aloud) ──
let isSpeakingPage = false;
let currentUtterance = null;

function toggleReadAloud() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    alert("Text-to-Speech is not supported on this browser.");
    return;
  }

  const btn = document.getElementById('tts-toggle-btn');
  if (!btn) return;

  if (window.speechSynthesis.speaking) {
    stopSpeakingPage();
    return;
  }

  const text = getPageText();
  if (!text) {
    alert(typeof Lang !== 'undefined' && Lang.getCurrent() === 'hi'
      ? "पढ़ने के लिए कोई पाठ्य सामग्री नहीं मिली।"
      : "No text content found to read.");
    return;
  }

  const lang = typeof Lang !== 'undefined' ? Lang.getCurrent() : 'en';
  isSpeakingPage = true;
  
  const stopLabel = typeof Lang !== 'undefined' ? Lang.t('stop_page') : 'Stop';
  btn.innerHTML = `⏹️ <span data-i18n="stop_page">${stopLabel}</span>`;
  btn.style.background = 'var(--red-500)';

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
  if (matchedVoice) {
    currentUtterance.voice = matchedVoice;
  }

  currentUtterance.onend = () => {
    resetTtsButtonState();
  };
  currentUtterance.onerror = () => {
    resetTtsButtonState();
  };

  window.speechSynthesis.speak(currentUtterance);
}

function stopSpeakingPage() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  resetTtsButtonState();
}

function resetTtsButtonState() {
  isSpeakingPage = false;
  currentUtterance = null;
  const btn = document.getElementById('tts-toggle-btn');
  if (btn) {
    const listenLabel = typeof Lang !== 'undefined' ? Lang.t('listen_page') : 'Listen';
    btn.innerHTML = `🔊 <span data-i18n="listen_page">${listenLabel}</span>`;
    btn.style.background = 'rgba(255,255,255,.15)';
  }
}

function getPageText() {
  const elements = document.querySelectorAll('h1, h2, h3, h4, p, li, td, th, .service-title, .service-village, .equip-tag, .product-card-title, .product-card-price, .post-card h4, .post-card p');
  const textParts = [];
  
  elements.forEach(el => {
    if (el.closest('header') || el.closest('footer') || el.closest('.noti-dropdown') || el.closest('button') || el.closest('.btn') || el.closest('.lang-toggle-btn') || el.closest('.nav-toggle') || el.closest('.tts-toggle-btn')) {
      return;
    }
    if (el.offsetParent === null) return;
    
    const txt = el.innerText || el.textContent;
    if (txt && txt.trim().length > 0) {
      if (txt.includes('function') || txt.includes('{') || txt.includes('=>')) return;
      textParts.push(txt.trim());
    }
  });

  const uniqueParts = [];
  textParts.forEach((part) => {
    if (uniqueParts[uniqueParts.length - 1] !== part) {
      uniqueParts.push(part);
    }
  });

  return uniqueParts.join('. ');
}

window.addEventListener('beforeunload', () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
});

// ============================================================
// Krishi Mitra — Voice-Activated AgriBot Assistant
// Floating chatbot available on every page via nav.js
// ============================================================
(function injectAgriBot() {
  const botHTML = `
  <!-- Krishi Mitra Floating Trigger -->
  <button id="agribot-trigger" class="agribot-trigger" onclick="toggleChatbot()" aria-label="Krishi Mitra Assistant" title="Krishi Mitra — Your Voice Assistant">
    <span class="agribot-trigger-icon">🌾</span>
    <span class="agribot-trigger-label" data-i18n="bot_title">Krishi Mitra</span>
    <span class="agribot-pulse"></span>
  </button>

  <!-- Krishi Mitra Chat Window -->
  <div id="agribot-window" class="agribot-chat-window" style="display:none;" role="dialog" aria-label="Krishi Mitra Chatbot">
    <!-- Header -->
    <div class="agribot-header">
      <div class="agribot-header-info">
        <div class="agribot-avatar">🌾</div>
        <div>
          <div class="agribot-header-title" data-i18n="bot_title">Krishi Mitra</div>
          <div class="agribot-header-status" id="agribot-status">● Online</div>
        </div>
      </div>
      <button class="agribot-close-btn" onclick="toggleChatbot()" aria-label="Close">✕</button>
    </div>

    <!-- Messages Area -->
    <div class="agribot-messages" id="agribot-messages"></div>

    <!-- Quick Action Chips -->
    <div class="agribot-chips" id="agribot-chips">
      <button class="agribot-chip" onclick="sendBotQuery('weather')">🌦️ Weather</button>
      <button class="agribot-chip" onclick="sendBotQuery('mandi price today')">💹 Mandi</button>
      <button class="agribot-chip" onclick="sendBotQuery('organic')">🌿 Organic</button>
      <button class="agribot-chip" onclick="sendBotQuery('ploughing rate bigha')">🚜 Ploughing</button>
      <button class="agribot-chip" onclick="sendBotQuery('store seed fertilizer')">🛒 Store</button>
      <button class="agribot-chip" onclick="sendBotQuery('kcc loan')">💰 Loan</button>
      <button class="agribot-chip" onclick="sendBotQuery('crop disease pest')">🐛 Disease</button>
      <button class="agribot-chip" onclick="sendBotQuery('irrigation drip')">💧 Irrigation</button>
      <button class="agribot-chip" onclick="sendBotQuery('government scheme pm kisan')">🏛️ Schemes</button>
      <button class="agribot-chip" onclick="sendBotQuery('help')">❓ Help</button>
    </div>

    <!-- Input Bar -->
    <div class="agribot-input-bar">
      <input type="text" id="agribot-input" class="agribot-input"
        placeholder="Ask Krishi Mitra..."
        data-i18n-ph="bot_placeholder"
        onkeydown="if(event.key==='Enter') sendBotMessage()"
        autocomplete="off"
      />
      <button class="agribot-mic-btn" id="agribot-mic" onclick="startBotListening()" title="Speak your question" aria-label="Microphone">🎙️</button>
      <button class="agribot-send-btn" onclick="sendBotMessage()" title="Send" aria-label="Send">➤</button>
    </div>
  </div>`;

  // Inject into body
  document.body.insertAdjacentHTML('beforeend', botHTML);

  // Show welcome message after short delay — silent (no TTS on page load)
  setTimeout(() => {
    const msg = typeof Lang !== 'undefined' ? Lang.t('bot_welcome') : "Hello! I am Krishi Mitra. Ask me about weather, prices, or farming.";
    addBotMessage(msg, null, null, true); // true = suppress TTS
  }, 800);
})();

// ── Toggle open/close ──
let _botOpen = false;
function toggleChatbot() {
  const win = document.getElementById('agribot-window');
  const trigger = document.getElementById('agribot-trigger');
  if (!win) return;
  _botOpen = !_botOpen;
  if (_botOpen) {
    win.style.display = 'flex';
    win.classList.add('agribot-open');
    trigger.classList.add('active');
    setTimeout(() => {
      const inp = document.getElementById('agribot-input');
      if (inp) inp.focus();
    }, 300);
  } else {
    win.classList.remove('agribot-open');
    win.classList.add('agribot-closing');
    trigger.classList.remove('active');
    setTimeout(() => {
      win.style.display = 'none';
      win.classList.remove('agribot-closing');
    }, 300);
  }
}

// ── Add a bot message bubble ──
// suppressTTS: if true, skips speaking (used for auto welcome on page load)
function addBotMessage(text, linkHref, linkLabel, suppressTTS) {
  const container = document.getElementById('agribot-messages');
  if (!container) return;

  // Show typing indicator first
  const typingId = 'agribot-typing-' + Date.now();
  container.insertAdjacentHTML('beforeend', `
    <div id="${typingId}" class="agribot-msg agribot-msg-bot agribot-msg-typing">
      <div class="agribot-bubble">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>
    </div>
  `);
  container.scrollTop = container.scrollHeight;

  // Replace with real message after a brief delay
  setTimeout(() => {
    const typing = document.getElementById(typingId);
    if (typing) typing.remove();

    let linkHTML = '';
    if (linkHref && linkLabel) {
      linkHTML = `<a href="${linkHref}" class="agribot-link">${linkLabel} →</a>`;
    }

    container.insertAdjacentHTML('beforeend', `
      <div class="agribot-msg agribot-msg-bot">
        <div class="agribot-avatar-sm">🌾</div>
        <div class="agribot-bubble">${text}${linkHTML ? '<br/>' + linkHTML : ''}</div>
      </div>
    `);
    container.scrollTop = container.scrollHeight;

    // Only speak if not suppressed (don't speak on page load)
    if (!suppressTTS) {
      speakBotReply(text);
    }
  }, 900);
}

// ── Add a user message bubble ──
function addUserMessage(text) {
  const container = document.getElementById('agribot-messages');
  if (!container) return;
  container.insertAdjacentHTML('beforeend', `
    <div class="agribot-msg agribot-msg-user">
      <div class="agribot-bubble">${text}</div>
    </div>
  `);
  container.scrollTop = container.scrollHeight;
}

// ── Send text message from input box ──
function sendBotMessage() {
  const input = document.getElementById('agribot-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  processBotQuery(text);
}

// ── Send from quick chip ──
function sendBotQuery(query) {
  addUserMessage(query);
  processBotQuery(query);
}

// ── Smart Rules Engine — Answer first, then link ──
function processBotQuery(text) {
  const q = text.toLowerCase();
  const lang = typeof Lang !== 'undefined' ? Lang.getCurrent() : 'en';
  const hi = lang === 'hi';
  const month = new Date().getMonth(); // 0=Jan ... 11=Dec

  // ── Detect district name if mentioned ──
  const upDistricts = ['lucknow','agra','kanpur','varanasi','meerut','allahabad','bareilly','aligarh','moradabad','saharanpur','gorakhpur','faizabad','jhansi','mathura','bulandshahr','sikandrabad','etah','etawah','farrukhabad','firozabad','muzaffarnagar','bijnor','shahjahanpur','rampur','hapur','ghaziabad','noida','gautam buddha nagar','ballia','azamgarh','deoria','kushinagar','mahrajganj','siddharthnagar','basti','sant kabir nagar','ambedkar nagar','sultanpur','amethi','rae bareli','unnao','hardoi','sitapur','lakhimpur kheri','bahraich','shravasti','balrampur','gonda','bijnor','amroha'];
  const detectedDistrict = upDistricts.find(d => q.includes(d));

  // ── Current season helper ──
  function getSeason() {
    if (month >= 5 && month <= 8) return 'kharif';     // Jun-Sep
    if (month >= 9 && month <= 11) return 'rabi_sow';  // Oct-Dec
    if (month >= 0 && month <= 3)  return 'rabi';      // Jan-Apr
    return 'zaid';                                      // May
  }

  // ── Live crop price knowledge base (₹/quintal, approximate UP mandi rates) ──
  const priceDB = {
    wheat:      { hi: 'गेहूँ',    range: '2200–2400', msp: '2275', tips: hi ? 'सरकारी MSP ₹2275/क्विंटल है। अच्छे बाजार के लिए अप्रैल-मई में बेचें।' : 'Govt MSP is ₹2275/qtl. Best price typically in Apr-May.' },
    paddy:      { hi: 'धान',      range: '1940–2200', msp: '2183', tips: hi ? 'MSP ₹2183/क्विंटल। सही नमी (14% से कम) पर ही बेचें।' : 'MSP ₹2183/qtl. Sell at correct moisture (below 14%).' },
    sugarcane:  { hi: 'गन्ना',    range: '340–370', msp: '370', tips: hi ? 'UP SAP ₹370/क्विंटल। मिल से टोकन लेकर समय पर पेराई करवाएं।' : 'UP SAP ₹370/qtl. Get mill token early for timely crushing.' },
    onion:      { hi: 'प्याज',    range: '800–2500', msp: '—', tips: hi ? 'प्याज की कीमत मौसम पर निर्भर। मई-जून में सबसे ऊँची कीमत मिलती है।' : 'Price varies seasonally. Peak prices in May-Jun.' },
    potato:     { hi: 'आलू',      range: '600–1200', msp: '—', tips: hi ? 'आलू फरवरी-मार्च में सस्ता होता है। कोल्ड स्टोरेज में रखकर जुलाई-अगस्त में बेचें।' : 'Store in cold storage and sell Jul-Aug for best price.' },
    mustard:    { hi: 'सरसों',    range: '5200–5600', msp: '5650', tips: hi ? 'MSP ₹5650/क्विंटल। मार्च-अप्रैल में NAFED पर बेचें।' : 'MSP ₹5650/qtl. Sell on NAFED in Mar-Apr.' },
    maize:      { hi: 'मक्का',    range: '1800–2100', msp: '2090', tips: hi ? 'MSP ₹2090/क्विंटल। अच्छी तरह सुखाकर ही बेचें।' : 'MSP ₹2090/qtl. Ensure proper drying before sale.' },
    soybean:    { hi: 'सोयाबीन', range: '3900–4400', msp: '4600', tips: hi ? 'MSP ₹4600/क्विंटल। अक्टूबर में बेचने से अच्छी कीमत मिलती है।' : 'MSP ₹4600/qtl. Best to sell in October.' },
    tomato:     { hi: 'टमाटर',   range: '400–3000', msp: '—', tips: hi ? 'टमाटर की कीमत बहुत बदलती है। जून-जुलाई में सबसे अधिक कीमत।' : 'Highly volatile. Peak prices Jun-Jul.' },
    garlic:     { hi: 'लहसुन',   range: '3000–8000', msp: '—', tips: hi ? 'मई-जून में अच्छी कीमत। सही भंडारण से 4-5 महीने रख सकते हैं।' : 'Peak May-Jun. Can store 4-5 months with proper handling.' },
  };

  // ── Detect crop in question ──
  function detectCrop(q) {
    if (/wheat|gehun|गेहूँ|gehu/.test(q)) return 'wheat';
    if (/paddy|rice|dhaan|धान|chawal/.test(q)) return 'paddy';
    if (/sugarcane|ganna|गन्ना/.test(q)) return 'sugarcane';
    if (/onion|pyaj|प्याज/.test(q)) return 'onion';
    if (/potato|aloo|आलू/.test(q)) return 'potato';
    if (/mustard|sarso|सरसों/.test(q)) return 'mustard';
    if (/maize|makka|मक्का|corn/.test(q)) return 'maize';
    if (/soybean|soya|सोयाबीन/.test(q)) return 'soybean';
    if (/tomato|tamatar|टमाटर/.test(q)) return 'tomato';
    if (/garlic|lahsun|लहसुन/.test(q)) return 'garlic';
    return null;
  }

  // ==============================================================
  // 1. WEATHER queries
  // ==============================================================
  if (/weather|मौसम|baarish|rain|forecast|temperature|तापमान|barish|humidity/.test(q)) {
    const seasonInfo = {
      kharif:   hi ? '☔ अभी खरीफ का मौसम है। मॉनसून सक्रिय है। धान, मक्का, सोयाबीन की बुवाई का समय है।\n🌡️ तापमान: 30–38°C | आर्द्रता: 70–90%\n⚠️ सुझाव: जलभराव से फसल बचाएं, कीटनाशक छिड़काव बारिश से पहले करें।'
                  : '☔ Kharif season active. Monsoon is on. Good time for Paddy, Maize, Soybean.\n🌡️ Temp: 30–38°C | Humidity: 70–90%\n⚠️ Tip: Avoid waterlogging. Spray pesticides before rain, not after.',
      rabi_sow: hi ? '🌾 रबी बुवाई का मौसम। तापमान गिर रहा है।\n🌡️ तापमान: 15–25°C | रातें ठंडी\n✅ सुझाव: गेहूँ (नवंबर 1–25), सरसों (अक्टूबर 15 – नवंबर 10), आलू बुवाई शुरू करें।\n⚠️ कोहरे से सावधान — फसल को ढकें।'
                  : '🌾 Rabi sowing season. Temperatures dropping.\n🌡️ Temp: 15–25°C | Cool nights\n✅ Tip: Sow Wheat (Nov 1–25), Mustard (Oct 15–Nov 10), Potato.\n⚠️ Beware of early fog — cover nurseries.',
      rabi:     hi ? '❄️ रबी फसल की देखभाल का समय।\n🌡️ तापमान: 8–20°C | सुबह कोहरा\n✅ सुझाव: गेहूँ में दूसरी सिंचाई (बुवाई के 40-45 दिन बाद)। पाले से फसल बचाएं।\n⚠️ सरसों में माहू कीट की जांच करें।'
                  : '❄️ Rabi crop care season.\n🌡️ Temp: 8–20°C | Morning fog\n✅ Tip: 2nd irrigation in Wheat (40-45 days after sowing). Protect from frost.\n⚠️ Check for aphids in Mustard.',
      zaid:     hi ? '🌞 जायद मौसम — गर्मी बढ़ रही है।\n🌡️ तापमान: 35–44°C | आर्द्रता: 20–40%\n✅ सुझाव: खरबूजा, तरबूज, लौकी की बुवाई करें। सुबह-शाम सिंचाई करें।\n⚠️ मई में लू से फसल और खुद को बचाएं।'
                  : '🌞 Zaid (summer) season — heat rising.\n🌡️ Temp: 35–44°C | Low humidity\n✅ Tip: Sow Muskmelon, Watermelon, Bottle Gourd. Irrigate morning & evening.\n⚠️ Protect crops from heat waves in May.',
    }[getSeason()];

    const districtNote = detectedDistrict
      ? (hi ? `\n\n📍 ${detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)} जिले के लिए विस्तृत 72-घंटे का पूर्वानुमान नीचे दिए गए लिंक पर देखें।`
            : `\n\n📍 For detailed 72-hr forecast for ${detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)}, see the Weather page.`)
      : (hi ? '\n\n📍 अपने जिले का सटीक पूर्वानुमान मौसम पृष्ठ पर देखें।' : '\n\n📍 Check the Weather page for your district\'s exact forecast.');

    addBotMessage(seasonInfo + districtNote, 'weather.html', hi ? 'मौसम पृष्ठ खोलें' : 'Open Weather Page');
    return;
  }

  // ==============================================================
  // 2. MARKET / PRICE queries
  // ==============================================================
  if (/price|mandi|market|मंडी|भाव|rate|दाम|wheat|gehun|paddy|dhaan|mustard|sarso|onion|pyaj|potato|aloo|sugarcane|ganna|maize|makka|tomato|garlic|lahsun|gehu|गेहूँ|सरसों|प्याज|आलू|गन्ना|लहसुन|टमाटर/.test(q)) {
    const crop = detectCrop(q);

    if (crop && priceDB[crop]) {
      const c = priceDB[crop];
      const cropName = hi ? c.hi : crop.charAt(0).toUpperCase() + crop.slice(1);
      const districtNote = detectedDistrict
        ? (hi ? ` (${detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)} क्षेत्र में)` : ` (near ${detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)})`)
        : '';
      const reply = hi
        ? `💹 ${cropName} का वर्तमान मंडी भाव${districtNote}:\n\n📊 बाजार दर: ₹${c.range} प्रति क्विंटल\n🏛️ सरकारी MSP: ₹${c.msp} प्रति क्विंटल\n\n💡 ${c.tips}`
        : `💹 ${cropName} current mandi price${districtNote}:\n\n📊 Market Rate: ₹${c.range} per quintal\n🏛️ Govt MSP: ₹${c.msp} per quintal\n\n💡 ${c.tips}`;
      addBotMessage(reply, 'market-price.html', hi ? 'लाइव मंडी भाव देखें' : 'View Live Mandi Prices');
    } else {
      // Generic with all common crops table
      const reply = hi
        ? `💹 आज के UP मंडी में प्रमुख फसलों के अनुमानित भाव:\n\n🌾 गेहूँ: ₹2200–2400/क्विंटल (MSP ₹2275)\n🌿 सरसों: ₹5200–5600/क्विंटल (MSP ₹5650)\n🌱 धान: ₹1940–2200/क्विंटल (MSP ₹2183)\n🥔 आलू: ₹600–1200/क्विंटल\n🧅 प्याज: ₹800–2500/क्विंटल\n🎋 गन्ना: ₹340–370/क्विंटल (SAP ₹370)\n\n💡 सुझाव: अपनी फसल का नाम बोलें — जैसे "गेहूँ का भाव" — और मैं सटीक जानकारी दूंगा।${detectedDistrict ? '\n📍 '+detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)+' जिले के लिए सरकारी पोर्टल पर जाएं।':''}`
        : `💹 Today's approximate UP Mandi prices:\n\n🌾 Wheat: ₹2200–2400/qtl (MSP ₹2275)\n🌿 Mustard: ₹5200–5600/qtl (MSP ₹5650)\n🌱 Paddy: ₹1940–2200/qtl (MSP ₹2183)\n🥔 Potato: ₹600–1200/qtl\n🧅 Onion: ₹800–2500/qtl\n🎋 Sugarcane: ₹340–370/qtl (SAP ₹370)\n\n💡 Tip: Ask about a specific crop (e.g. "wheat price") for exact details.${detectedDistrict ? '\n📍 Showing rates near '+detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)+'.' : ''}`;
      addBotMessage(reply, 'market-price.html', hi ? 'लाइव मंडी भाव देखें' : 'View Live Mandi Prices');
    }
    return;
  }

  // ==============================================================
  // 3. ORGANIC FARMING queries
  // ==============================================================
  if (/organic|जैविक|natural|प्राकृतिक|compost|vermi|paramparagat|jeevamrit|jivamrit|नीम/.test(q)) {
    const reply = hi
      ? `🌿 जैविक खेती के मुख्य फायदे:\n\n✅ मिट्टी की उर्वरता 3–5 साल में 30% बढ़ जाती है\n✅ लागत 40% तक कम होती है (यूरिया/DAP की बचत)\n✅ PM Paramparagat Krishi Vikas Yojana (PKVY) से ₹50,000/हेक्टेयर अनुदान\n\n📋 आसान शुरुआत:\n• वर्मीकम्पोस्ट बनाएं — केवल गोबर और जैविक कचरे से\n• जीवामृत — 200 लीटर पानी + 10 kg गोबर + 2 kg बेसन + नीम पत्ती\n• नीम का काढ़ा — कीटनाशक का सस्ता विकल्प\n\n💰 जैविक उत्पाद 20–40% महंगे बिकते हैं मंडी में।`
      : `🌿 Benefits of Organic Farming:\n\n✅ Soil fertility increases 30% in 3–5 years\n✅ Input costs drop by ~40% (save on Urea/DAP)\n✅ PM PKVY scheme gives ₹50,000/hectare subsidy\n\n📋 Easy starting steps:\n• Vermicompost: cow dung + organic waste + earthworms\n• Jeevamrit: 200L water + 10kg cow dung + 2kg gram flour + neem leaves\n• Neem Kashayam: natural cheap pesticide alternative\n\n💰 Organic produce sells 20–40% higher in premium markets.`;
    addBotMessage(reply, 'comparison.html', hi ? 'जैविक vs रासायनिक तुलना' : 'Compare Organic vs Chemical');
    return;
  }

  // ==============================================================
  // 4. PLOUGHING / TRACTOR queries
  // ==============================================================
  if (/plough|jutai|जुताई|tractor|ट्रैक्टर|rotavator|drill|bigha|बीघा|harrow|tillage/.test(q)) {
    const reply = hi
      ? `🚜 UP में जुताई की सामान्य दरें (₹ प्रति बीघा):\n\n🔧 रोटावेटर (Rotavator): ₹200–220/बीघा\n📐 कम्प्यूटर मंझा (Laser Leveling): ₹180–200/बीघा\n🌀 ट्रिल / हैरो (Trill/Harrow): ₹150–180/बीघा\n🌱 बीज ड्रिल (Seed Drill): ₹120–150/बीघा\n\n💡 सुझाव:\n• रोटावेटर से मिट्टी भुरभुरी होती है — गेहूँ के लिए सबसे उपयुक्त\n• कम्प्यूटर मंझा से पानी 25–30% कम लगता है\n• जुताई से पहले मिट्टी में पर्याप्त नमी होनी चाहिए\n\n📍 अपने क्षेत्र में ट्रैक्टर किराए पर लेने के लिए:${detectedDistrict ? ' '+detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1)+' में' : ''}`
      : `🚜 Common ploughing rates in UP (₹ per bigha):\n\n🔧 Rotavator: ₹200–220/bigha\n📐 Computer Manjha (Laser Leveling): ₹180–200/bigha\n🌀 Trill / Harrow: ₹150–180/bigha\n🌱 Seed Drill: ₹120–150/bigha\n\n💡 Tips:\n• Rotavator gives fine tilth — best for Wheat sowing\n• Laser Leveling (Computer Manjha) saves 25–30% irrigation water\n• Ensure adequate soil moisture before ploughing\n\n📍 Find tractor operators${detectedDistrict ? ' near '+detectedDistrict.charAt(0).toUpperCase()+detectedDistrict.slice(1) : ' in your district'}:`;
    addBotMessage(reply, 'ploughing-services.html', hi ? 'जुताई सेवाएं देखें' : 'View Ploughing Services');
    return;
  }

  // ==============================================================
  // 5. FERTILIZER / SEEDS / STORE queries
  // ==============================================================
  if (/fertiliz|urea|dap|खाद|उर्वरक|seed|बीज|pesticide|कीटनाशक|store|दुकान|tool|equipment/.test(q)) {
    const crop = detectCrop(q);
    let fertReply = '';
    if (/urea|यूरिया/.test(q)) {
      fertReply = hi
        ? `🧪 यूरिया की जानकारी:\n\n💰 सरकारी मूल्य: ₹266.50/बैग (45 kg) — नीम कोटेड\n📋 उपयोग:\n• गेहूँ: बुवाई पर 50 kg/हेक्टेयर + 25 kg टिलरिंग पर\n• धान: 40–50 kg/हेक्टेयर (3 बार में बांटें)\n⚠️ जरूरत से ज्यादा यूरिया फसल जलाता है — सही मात्रा जरूरी`
        : `🧪 Urea Information:\n\n💰 Govt Price: ₹266.50/bag (45 kg) — Neem Coated\n📋 Usage:\n• Wheat: 50 kg/hectare at sowing + 25 kg at tillering\n• Paddy: 40–50 kg/hectare (split in 3 doses)\n⚠️ Over-application burns crops — use soil test recommendations`;
    } else if (/dap|डी.ए.पी/.test(q)) {
      fertReply = hi
        ? `🧪 DAP (डाई अमोनियम फॉस्फेट):\n\n💰 मूल्य: ₹1350/बैग (50 kg)\n📋 उपयोग:\n• बुवाई के समय बेसल डोज के रूप में डालें\n• गेहूँ: 100–120 kg/हेक्टेयर | धान: 80–100 kg/हेक्टेयर\n💡 SSP (सिंगल सुपर फॉस्फेट) ₹450 में मिलता है — अगर DAP महंगा हो`
        : `🧪 DAP (Di-Ammonium Phosphate):\n\n💰 Price: ₹1350/bag (50 kg)\n📋 Usage:\n• Apply as basal dose at sowing time\n• Wheat: 100–120 kg/hectare | Paddy: 80–100 kg/hectare\n💡 SSP (Single Super Phosphate) at ₹450 is a cheaper alternative`;
    } else {
      fertReply = hi
        ? `🛒 कृषि स्टोर में उपलब्ध प्रमुख चीजें:\n\n🌱 बीज: गेहूँ (HD-2967, PBW-343), सरसों (पूसा बोल्ड), धान (1121 बासमती)\n🧪 उर्वरक: यूरिया ₹266/बैग | DAP ₹1350/बैग | पोटाश ₹900/बैग\n🐛 कीटनाशक: क्लोरपायरीफॉस, ट्राइकोडर्मा, नीम तेल\n🔧 उपकरण: स्प्रेयर, बीज ड्रिल, मिट्टी परीक्षण किट\n\n💡 अच्छे बीज = 20-30% ज्यादा पैदावार।`
        : `🛒 Products available in Agri Store:\n\n🌱 Seeds: Wheat (HD-2967, PBW-343), Mustard (Pusa Bold), Paddy (1121 Basmati)\n🧪 Fertilizers: Urea ₹266/bag | DAP ₹1350/bag | Potash ₹900/bag\n🐛 Pesticides: Chlorpyrifos, Trichoderma, Neem Oil\n🔧 Tools: Sprayers, Seed Drills, Soil Test Kits\n\n💡 Quality seeds = 20–30% higher yield.`;
    }
    addBotMessage(fertReply, 'store.html', hi ? 'कृषि स्टोर खोलें' : 'Open Agri Store');
    return;
  }

  // ==============================================================
  // 6. LOAN / KCC / FINANCE queries
  // ==============================================================
  if (/loan|ऋण|kcc|kisan credit|credit card|subsidy|सब्सिडी|finance|pm kisan/.test(q)) {
    const reply = hi
      ? `💰 किसान क्रेडिट कार्ड (KCC) की मुख्य जानकारी:\n\n✅ ब्याज दर: मात्र 4% प्रति वर्ष (सब्सिडी के बाद)\n✅ लोन राशि: ₹1.6 लाख तक बिना जमानत के\n✅ PM-Kisan: ₹6000/वर्ष (3 किस्तों में)\n\n📋 KCC के लिए जरूरी दस्तावेज:\n• आधार कार्ड | खतौनी | पासपोर्ट फोटो\n• बैंक में आवेदन करें — 14 दिन में मिलता है\n\n🏦 PM Fasal Bima: प्रीमियम मात्र 1.5–2% (खरीफ/रबी)`
      : `💰 Kisan Credit Card (KCC) Key Info:\n\n✅ Interest Rate: Only 4% per year (after govt subsidy)\n✅ Loan Amount: Up to ₹1.6 Lakh without collateral\n✅ PM-Kisan: ₹6000/year (3 installments)\n\n📋 Documents for KCC:\n• Aadhaar Card | Land Records (Khatauni) | Passport Photo\n• Apply at your nearest bank — approved in 14 days\n\n🏦 PM Fasal Bima Yojana: Premium only 1.5–2% for Kharif/Rabi`;
    addBotMessage(reply, 'loan-calculator.html', hi ? 'ऋण कैलकुलेटर खोलें' : 'Open Loan Calculator');
    return;
  }

  // ==============================================================
  // 7. COMMUNITY / FORUM queries
  // ==============================================================
  if (/community|forum|discuss|chat|मंच|किसान मंच|question|sawaal|सवाल/.test(q)) {
    const reply = hi
      ? `💬 किसान मंच पर हाल की चर्चाएं:\n\n🔥 "मक्के में तना छेदक कीट से कैसे बचाएं?"\n🔥 "गेहूँ में पीला रतुआ रोग की पहचान"\n🔥 "कोल्ड स्टोरेज में आलू कब तक रख सकते हैं?"\n🔥 "UP में धान की MSP 2024 क्या है?"\n\n✅ पंजीकृत किसान ही सवाल पूछ सकते हैं और जवाब दे सकते हैं।`
      : `💬 Recent discussions on Farmer Forum:\n\n🔥 "How to control stem borer in Maize?"\n🔥 "Identifying Yellow Rust disease in Wheat"\n🔥 "How long to store Potato in cold storage?"\n🔥 "What is the paddy MSP for UP in 2024?"\n\n✅ Only registered farmers can post questions and replies.`;
    addBotMessage(reply, 'chat.html', hi ? 'किसान मंच खोलें' : 'Open Community Forum');
    return;
  }

  // ==============================================================
  // 8. CROP PLANNER / SOWING queries
  // ==============================================================
  if (/crop|फसल|planner|kharif|rabi|season|sow|plant|बुवाई|कब|when to sow|nursery/.test(q)) {
    const cropCalendar = {
      kharif:   hi ? '☀️ खरीफ 2024 बुवाई कैलेंडर:\n\n🌱 धान: जून 15 – जुलाई 15\n🌽 मक्का: जून 1 – जुलाई 15\n🫘 सोयाबीन: जून 15 – जुलाई 10\n🎋 गन्ना: फरवरी-मार्च (बसंतकालीन)\n\n💡 खरीफ फसलों में नाइट्रोजन ज्यादा चाहिए। जैविक खाद डालें।'
                  : '☀️ Kharif 2024 Sowing Calendar:\n\n🌱 Paddy: Jun 15 – Jul 15\n🌽 Maize: Jun 1 – Jul 15\n🫘 Soybean: Jun 15 – Jul 10\n🎋 Sugarcane: Feb-Mar (Spring planting)\n\n💡 Kharif crops need more Nitrogen. Apply organic matter.',
      rabi_sow: hi ? '❄️ रबी 2024–25 बुवाई कैलेंडर:\n\n🌾 गेहूँ: नवंबर 1–25 (समय पर) | नवंबर 25 – दिसंबर 15 (देर)\n🌿 सरसों: अक्टूबर 15 – नवंबर 10\n🥔 आलू: अक्टूबर 1 – नवंबर 15\n🫛 मसूर/चना: अक्टूबर 15 – नवंबर 30\n\n💡 गेहूँ की उन्नत किस्में: HD-2967, DBW-222, PBW-343'
                  : '❄️ Rabi 2024–25 Sowing Calendar:\n\n🌾 Wheat: Nov 1–25 (timely) | Nov 25 – Dec 15 (late sowing)\n🌿 Mustard: Oct 15 – Nov 10\n🥔 Potato: Oct 1 – Nov 15\n🫛 Lentil/Gram: Oct 15 – Nov 30\n\n💡 Top Wheat varieties: HD-2967, DBW-222, PBW-343',
      rabi:     hi ? '🌾 रबी फसल देखभाल टिप्स:\n\n💧 गेहूँ: 6 सिंचाई (CRI, कल्ले, बाली, दाना भरने पर)\n🌿 सरसों: 2 सिंचाई (फूल+फली अवस्था में)\n🥔 आलू: 8–10 दिन पर हल्की सिंचाई करें\n\n⚠️ इस समय झुलसा रोग (Late Blight) का खतरा — Mancozeb/Copper Oxychloride का छिड़काव करें।'
                  : '🌾 Rabi crop care tips:\n\n💧 Wheat: 6 irrigations (CRI, Tillering, Ear, Grain filling)\n🌿 Mustard: 2 irrigations (flower + pod stage)\n🥔 Potato: Light irrigation every 8–10 days\n\n⚠️ Risk of Late Blight now — spray Mancozeb / Copper Oxychloride.',
      zaid:     hi ? '🌞 जायद (ग्रीष्मकालीन) फसल कैलेंडर:\n\n🍉 तरबूज/खरबूजा: फरवरी 15 – मार्च 15\n🥒 लौकी/करेला: फरवरी-मार्च\n🌽 बेबी कॉर्न: मार्च-अप्रैल\n\n💡 गर्मी में फसल को धूप से बचाएं — मल्चिंग करें और सुबह-शाम सिंचाई करें।'
                  : '🌞 Zaid (Summer) crop calendar:\n\n🍉 Watermelon/Muskmelon: Feb 15 – Mar 15\n🥒 Bottle Gourd/Bitter Gourd: Feb-Mar\n🌽 Baby Corn: Mar-Apr\n\n💡 Use mulching and irrigate morning & evening to protect from heat.',
    }[getSeason()];
    addBotMessage(cropCalendar, 'crop-planner.html', hi ? 'फसल योजनाकार खोलें' : 'Open Crop Planner');
    return;
  }

  // ==============================================================
  // 9. DISEASE / PEST queries
  // ==============================================================
  if (/disease|रोग|pest|कीट|blight|rust|रतुआ|fungus|फफूंद|insect|spray|छिड़काव/.test(q)) {
    const reply = hi
      ? `🐛 प्रमुख फसल रोग और उपचार:\n\n🌾 गेहूँ:\n• पीला रतुआ (Yellow Rust): Propiconazole 25EC @ 0.1%\n• करनाल बंट: Tebuconazole @ 1 ml/L\n\n🌿 सरसों:\n• माहू/एफिड: Dimethoate 30EC @ 2 ml/L\n\n🌱 धान:\n• ब्लास्ट रोग: Tricyclazole @ 0.06%\n• BPH (भूरा माहू): Chlorpyrifos 20EC\n\n⚠️ छिड़काव सुबह या शाम करें — दोपहर की धूप में नहीं।`
      : `🐛 Common Crop Diseases & Treatment:\n\n🌾 Wheat:\n• Yellow Rust: Propiconazole 25EC @ 0.1%\n• Karnal Bunt: Tebuconazole @ 1 ml/L\n\n🌿 Mustard:\n• Aphids: Dimethoate 30EC @ 2 ml/L\n\n🌱 Paddy:\n• Blast: Tricyclazole @ 0.06%\n• BPH (Brown Plant Hopper): Chlorpyrifos 20EC\n\n⚠️ Always spray in the morning or evening — never in afternoon heat.`;
    addBotMessage(reply, 'education.html', hi ? 'शिक्षा केंद्र देखें' : 'View Education Hub');
    return;
  }

  // ==============================================================
  // 10. IRRIGATION / WATER queries
  // ==============================================================
  if (/irrigation|सिंचाई|water|पानी|drip|sprinkler|canal|nehr|नहर/.test(q)) {
    const reply = hi
      ? `💧 सिंचाई की जानकारी:\n\n🚿 ड्रिप सिंचाई: 50–70% पानी की बचत | सब्सिडी: SC/ST को 90%, अन्य को 75%\n🌧️ स्प्रिंकलर: 30–40% बचत | लघु/सीमांत किसान को 80% अनुदान\n\n💡 फसलवार सिंचाई:\n• गेहूँ: 35–38 cm पानी (6 बार में)\n• धान: 120–150 cm पानी\n• आलू: 50–60 cm पानी\n\n🏛️ PM Krishi Sinchayee Yojana से ड्रिप/स्प्रिंकलर पर सब्सिडी पाएं।`
      : `💧 Irrigation Information:\n\n🚿 Drip Irrigation: Saves 50–70% water | Subsidy: 90% for SC/ST, 75% for others\n🌧️ Sprinkler: Saves 30–40% | 80% subsidy for small/marginal farmers\n\n💡 Crop water requirements:\n• Wheat: 35–38 cm (6 irrigations)\n• Paddy: 120–150 cm\n• Potato: 50–60 cm\n\n🏛️ Get drip/sprinkler subsidy via PM Krishi Sinchayee Yojana.`;
    addBotMessage(reply, 'crop-planner.html', hi ? 'फसल योजनाकार खोलें' : 'Open Crop Planner');
    return;
  }

  // ==============================================================
  // 11. GOVERNMENT SCHEMES queries
  // ==============================================================
  if (/scheme|yojana|योजना|government|सरकार|subsidy|pm kisan|pkvy|fasal bima|insurance/.test(q)) {
    const reply = hi
      ? `🏛️ किसानों के लिए प्रमुख सरकारी योजनाएं:\n\n✅ PM-Kisan: ₹6000/वर्ष (तीन किस्त)\n✅ PM Fasal Bima Yojana: फसल बीमा — 1.5–2% प्रीमियम\n✅ Kisan Credit Card (KCC): 4% ब्याज पर ₹1.6 लाख तक ऋण\n✅ PKVY: जैविक खेती पर ₹50,000/हेक्टेयर\n✅ PM KUSUM: सोलर पंप पर 90% सब्सिडी\n✅ मृदा स्वास्थ्य कार्ड: मुफ्त मिट्टी जांच\n\n📱 आवेदन करें: pmkisan.gov.in | pmfby.gov.in`
      : `🏛️ Key Govt Schemes for Farmers:\n\n✅ PM-Kisan: ₹6000/year (3 installments)\n✅ PM Fasal Bima Yojana: Crop Insurance — 1.5–2% premium\n✅ Kisan Credit Card (KCC): Loan at 4% up to ₹1.6 Lakh\n✅ PKVY: ₹50,000/hectare for Organic Farming\n✅ PM KUSUM: 90% subsidy on Solar Pumps\n✅ Soil Health Card: Free soil testing\n\n📱 Apply at: pmkisan.gov.in | pmfby.gov.in`;
    addBotMessage(reply, 'loan-calculator.html', hi ? 'ऋण कैलकुलेटर' : 'Loan Calculator');
    return;
  }

  // ==============================================================
  // 12. HELP / WHAT CAN YOU DO
  // ==============================================================
  if (/help|मदद|what can you|क्या बता सकते|how to use|kaise|कैसे/.test(q)) {
    const reply = hi
      ? `🌾 मैं कृषि मित्र हूँ! मैं इन विषयों में मदद कर सकता हूँ:\n\n🌦️ मौसम — "कल बारिश होगी क्या?"\n💹 मंडी भाव — "गेहूँ का आज क्या भाव है?"\n🌿 जैविक खेती — "जैविक खाद कैसे बनाएं?"\n🚜 जुताई — "रोटावेटर की दर क्या है?"\n🐛 रोग/कीट — "गेहूँ में रतुआ रोग का इलाज"\n💰 लोन — "KCC कैसे मिलता है?"\n🏛️ सरकारी योजना — "PM-Kisan के लिए कैसे आवेदन करें?"\n💧 सिंचाई — "ड्रिप सिंचाई की सब्सिडी कितनी है?"\n\n💡 या नीचे दिए चिप्स पर क्लिक करें!`
      : `🌾 I'm Krishi Mitra! I can help you with:\n\n🌦️ Weather — "Will it rain tomorrow?"\n💹 Market Prices — "What is today's wheat price?"\n🌿 Organic Farming — "How to make vermicompost?"\n🚜 Ploughing Rates — "What is Rotavator rate per bigha?"\n🐛 Disease/Pest — "How to treat Yellow Rust in Wheat?"\n💰 Loans — "How to get KCC loan?"\n🏛️ Govt Schemes — "How to apply for PM-Kisan?"\n💧 Irrigation — "Drip irrigation subsidy details?"\n\n💡 Or just click one of the chips below!`;
    addBotMessage(reply);
    return;
  }

  // ==============================================================
  // No match — suggest what to ask
  // ==============================================================
  const noMatchReply = hi
    ? `🤔 मुझे यह समझ नहीं आया। आप मुझसे पूछ सकते हैं:\n\n• "गेहूँ का आज क्या भाव है?"\n• "बुलंदशहर में कल बारिश होगी?"\n• "KCC लोन कैसे मिलता है?"\n• "जैविक खाद कैसे बनाएं?"\n• "रोटावेटर की दर क्या है?"\n\n💡 "help" लिखें — पूरी सूची देखें।`
    : `🤔 I didn't understand that. Try asking:\n\n• "What is today's wheat price?"\n• "Will it rain in Bulandshahr tomorrow?"\n• "How to get KCC loan?"\n• "How to make vermicompost?"\n• "What is rotavator rate per bigha?"\n\n💡 Type "help" to see everything I can answer.`;
  addBotMessage(noMatchReply);
}

// ── Text-to-Speech for bot replies ──
function speakBotReply(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

  const lang = typeof Lang !== 'undefined' ? Lang.getCurrent() : 'en';
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utter.rate = 0.95;
  utter.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
  if (matchedVoice) utter.voice = matchedVoice;

  window.speechSynthesis.speak(utter);
}

// ── Microphone / Speech Recognition ──
let _botRecognizing = false;
let _botRecognition = null;

function startBotListening() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    const msg = typeof Lang !== 'undefined' && Lang.getCurrent() === 'hi'
      ? 'माफ करें, आपका ब्राउज़र माइक्रोफ़ोन इनपुट का समर्थन नहीं करता।'
      : 'Sorry, your browser does not support voice input.';
    addBotMessage(msg);
    return;
  }

  if (_botRecognizing) {
    if (_botRecognition) _botRecognition.stop();
    return;
  }

  const lang = typeof Lang !== 'undefined' ? Lang.getCurrent() : 'en';
  const micBtn = document.getElementById('agribot-mic');
  const input = document.getElementById('agribot-input');
  const statusEl = document.getElementById('agribot-status');

  _botRecognition = new SpeechRec();
  _botRecognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  _botRecognition.interimResults = false;
  _botRecognition.maxAlternatives = 1;

  _botRecognizing = true;
  if (micBtn) {
    micBtn.textContent = '🔴';
    micBtn.classList.add('listening');
  }
  if (statusEl) {
    statusEl.textContent = typeof Lang !== 'undefined' ? Lang.t('bot_listening') : 'Listening...';
    statusEl.classList.add('listening');
  }
  if (input) input.placeholder = typeof Lang !== 'undefined' ? Lang.t('bot_listening') : 'Listening... Speak now...';

  _botRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (input) input.value = transcript;
    addUserMessage(transcript);
    processBotQuery(transcript);
  };

  _botRecognition.onerror = (event) => {
    console.warn('AgriBot STT error:', event.error);
  };

  _botRecognition.onend = () => {
    _botRecognizing = false;
    if (micBtn) {
      micBtn.textContent = '🎙️';
      micBtn.classList.remove('listening');
    }
    if (statusEl) {
      statusEl.textContent = '● Online';
      statusEl.classList.remove('listening');
    }
    if (input) {
      input.placeholder = typeof Lang !== 'undefined' ? Lang.t('bot_placeholder') : 'Ask Krishi Mitra...';
      input.value = '';
    }
  };

  _botRecognition.start();
}
