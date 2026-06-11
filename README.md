# 🚜 Kishan Sathi — किसान साथी

**Smart Farming Companion for Uttar Pradesh Farmers**

A full-stack web application providing real-time weather, live mandi prices, crop planning, education, an agri store, and a community forum for farmers across Uttar Pradesh.

---

## 📁 Project Structure

```
kishan-sathi/
│
├── index.html              # Homepage with hero, features, govt schemes
├── weather.html            # 72-hr forecast, temp chart, crop advisories
├── market-price.html       # Live mandi prices via data.gov.in API
├── crop-planner.html       # Season-wise crop recommendations
├── education.html          # 24-crop guides, farming videos, schemes
├── chat.html               # Community forum with real backend
├── store.html              # Online agri store with cart & order flow
├── comparison.html         # Organic vs Chemical farming comparison
├── loan-calculator.html    # EMI calculator with amortization schedule
├── my-areastore.html       # Add/browse local offline agri stores
│
├── style.css               # Master design system (shared across all pages)
├── nav.js                  # Shared header + footer injector
├── api.js                  # Frontend API client (backend + localStorage fallback)
│
├── server.js               # Node.js + Express backend
├── package.json            # Backend dependencies
│
├── db/                     # Auto-created SQLite database
├── uploads/                # Auto-created uploads directory
│   ├── stores/             # Store images
│   └── forum/              # Forum attachments
│
└── images/                 # Crop & product images (your existing images)
    store/                  # Product images for online store
    guide/                  # Crop guide images for education hub
```

---

## 🚀 Quick Start

### Option A — Frontend Only (no backend needed)

Just open `index.html` in your browser. Everything works with:
- Real weather data (OpenWeatherMap API)
- Real mandi prices (data.gov.in API)
- Forum & store data stored in `localStorage`

```bash
# Using VS Code Live Server, or:
npx serve .
```

### Option B — Full Stack (with backend)

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
# → Server running at http://localhost:3000

# 3. Open browser
open http://localhost:3000
```

---

## 🗄️ Backend API Endpoints

### Forum
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forum/posts` | Get all posts (supports `?topic=&search=&sort=newest/popular`) |
| POST | `/api/forum/posts` | Create new post `{ user, title, message, topic }` |
| POST | `/api/forum/posts/:id/like` | Toggle like on a post |
| GET | `/api/forum/stats` | Get forum stats (total posts, users, likes) |
| DELETE | `/api/forum/posts/:id` | Delete a post |

### Local Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | Get all stores (supports `?district=`) |
| POST | `/api/stores` | Create store (multipart/form-data with image upload) |
| DELETE | `/api/stores/:id` | Delete a store |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place a new order `{ customerName, address, phone, payment, items, total }` |
| GET | `/api/orders` | Get all orders (admin) |
| PATCH | `/api/orders/:id/status` | Update order status |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check if server is running |

---

## 🔑 External APIs Used

| API | Purpose | Key Location |
|-----|---------|--------------|
| [OpenWeatherMap](https://openweathermap.org/api) | Weather forecast & current conditions | `weather.html` → `apiKey` |
| [data.gov.in](https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070) | Live mandi commodity prices | `market-price.html` → `API_KEY` |

---

## 🛠️ Tech Stack

**Frontend**
- Pure HTML5, CSS3, Vanilla JavaScript (no framework)
- Chart.js for weather & loan charts
- Google Fonts (Yatra One, DM Sans)
- Fully responsive — mobile first

**Backend**
- Node.js + Express
- better-sqlite3 (SQLite — zero setup, no separate DB server)
- Multer (image uploads)
- CORS enabled

---

## 📱 Pages Overview

| Page | Features |
|------|----------|
| **Home** | Hero, feature grid, government scheme links, live ticker |
| **Weather** | District selector (75+ UP districts), 72-hr forecast, temp chart, crop suggestions, weather alerts |
| **Market Prices** | Government API, district+mandi selector, searchable/sortable table, price stats |
| **Crop Planner** | Kharif/Rabi/Zaid season tabs, 9 crops with detailed seed/irrigation/cost info |
| **Education Hub** | 24 crop guides with modal details, 18+ farming videos, govt scheme links |
| **Community Forum** | Post discussions, topics, likes, search, sort — backend connected |
| **Agri Store** | 40+ products (seeds/fertilizers/pesticides/tools), cart, order flow, offline store finder |
| **Organic vs Chemical** | Radar chart comparison, detailed table, pros/cons |
| **Loan Calculator** | Slider-based EMI calculator, donut chart, yearly amortization table, scheme links |
| **My Area Store** | Add/browse local agri stores with image upload — backend connected |

---

## 🌐 Deployment

### On a VPS (e.g. Hostinger, Railway, Render)
```bash
npm install
node server.js
```

### Environment Variables (optional)
```env
PORT=3000
```

---

## 📞 Farmer Helplines (embedded in app)
- **Kisan Call Centre:** 1800-180-1551 (free, 24×7)
- **Agri Helpline:** 1551
- **PM Fasal Bima:** 1800-200-7710

---

*© 2025 Kishan Sathi — Empowering Indian Farmers with Smart Digital Tools*
