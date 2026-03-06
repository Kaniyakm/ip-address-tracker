# 🌐 IP Address Tracker

> A responsive IP Address Tracker built with pure **HTML5**, **CSS3**, and **vanilla JavaScript** — no frameworks, no build tools.



## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [APIs Used](#apis-used)
- [How to Unzip & Run Locally](#how-to-unzip--run-locally)
- [How to Deploy to GitHub Pages](#how-to-deploy-to-github-pages)
- [Style Guide](#style-guide)
- [Accessibility](#accessibility)
- [Author](#author)

---

## Overview

This app lets users look up the geographic location of any **IP address** or **domain name** and display it on an interactive map. On load, it automatically detects and displays the visitor's own IP.

### The Challenge

Users should be able to:

- ✅ See their own IP address on the map on initial page load  
- ✅ Search for any IP address or domain and see key information & location  
- ✅ View the optimal layout depending on device screen size  
- ✅ See hover states for all interactive elements  

---

## Features

| Feature | Detail |
|---|---|
| **Auto IP detect** | Fetches and pins the visitor's own IP on first load |
| **IP / Domain search** | Accepts IPv4, IPv6, or domain name |
| **Interactive map** | Leaflet.js + OpenStreetMap with smooth fly-to animation |
| **Info card** | Displays IP address, location, UTC timezone offset, ISP |
| **Search history** | Dropdown of last 6 searches, persisted in localStorage |
| **Click-to-copy** | Click any info cell to copy its value to clipboard |
| **Share button** | Generates a shareable `?q=` URL |
| **My IP button** | Resets the map to the visitor's own IP |
| **URL param support** | `?q=8.8.8.8` pre-loads a search result on page load |
| **Responsive** | Mobile-first layout from 375px up to 1440px+ |
| **Accessible** | ARIA labels, keyboard nav, live error announcements |

---

## Project Structure

```
ip-address-tracker/
├── index.html    ← HTML structure & semantic markup
├── style.css     ← All styles (CSS variables, layout, animations, responsive)
├── app.js        ← All JavaScript logic (map, API, history, clipboard)
└── README.md     ← This file
```

---

## APIs Used

### 1. IP Geolocation — [ip-api.com](https://ip-api.com)

Free, no API key needed. Rate limited to **45 requests/minute** on the free tier.

| Endpoint | Purpose |
|---|---|
| `https://ip-api.com/json/` | Detect caller's IP automatically |
| `https://ip-api.com/json/{query}` | Look up specific IP or domain |

**Fields used:** `query`, `city`, `regionName`, `country`, `zip`, `lat`, `lon`, `timezone`, `isp`

> ⚠️ ip-api.com does **not** support HTTPS on the free tier for requests from paid hosting.  
> For production, upgrade to [ip-api Pro](https://ip-api.com/#pro) or switch to [ipify + ipinfo.io](https://ipinfo.io/).

### 2. Map — [Leaflet.js 1.9.4](https://leafletjs.com) + [OpenStreetMap](https://www.openstreetmap.org)

Loaded via CDN. No API key required.

---

## How to Unzip & Run Locally

### Step 1 — Download & Unzip

**macOS / Linux (Terminal):**
```bash
# Navigate to your Downloads folder (or wherever you saved the zip)
cd ~/Downloads

# Unzip the file
unzip ip-address-tracker.zip

# Enter the project folder
cd ip-address-tracker
```

**Windows (Command Prompt / PowerShell):**
```powershell
# Navigate to Downloads
cd C:\Users\YourName\Downloads

# Unzip (PowerShell)
Expand-Archive -Path ip-address-tracker.zip -DestinationPath ip-address-tracker

# Enter folder
cd ip-address-tracker
```

**Windows Explorer (GUI):**
1. Right-click `ip-address-tracker.zip`
2. Select **"Extract All…"**
3. Choose your destination folder
4. Click **Extract**

---

### Step 2 — Run Locally

**Option A — Open directly (simplest):**
```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows — double-click index.html in File Explorer
```

> ⚠️ The ip-api.com geolocation API requires an internet connection.  
> Some browsers block `fetch()` from `file://` URLs. If the map loads but data doesn't appear, use Option B.

**Option B — Local dev server (recommended):**

Using Node.js:
```bash
npx serve .
# → Open http://localhost:3000
```

Using Python:
```bash
# Python 3
python3 -m http.server 8080
# → Open http://localhost:8080

# Python 2
python -m SimpleHTTPServer 8080
```

Using VS Code:
- Install the **Live Server** extension
- Right-click `index.html` → **Open with Live Server**

---

## How to Deploy to GitHub Pages

### Prerequisites

- A [GitHub account](https://github.com)
- [Git](https://git-scm.com/downloads) installed on your computer

---

### Step 1 — Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `ip-address-tracker` (or any name you like)
3. Set visibility to **Public**
4. **Do NOT** tick "Add a README file" (you already have one)
5. Click **Create repository**

---

### Step 2 — Push Your Code

Open your terminal in the unzipped project folder:

```bash
# Initialise git (if not already done)
git init

# Add all project files
git add .

# Make your first commit
git commit -m "Initial commit: IP Address Tracker"

# Link to your GitHub repo  (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/ip-address-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub  
2. Click **Settings** (top tab)  
3. In the left sidebar, click **Pages**  
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

GitHub will display a banner:  
> ✅ *"Your site is live at `https://YOUR_USERNAME.github.io/ip-address-tracker/`"*

This usually takes **1–2 minutes** to go live.

---

### Step 4 — View Your Live Site

```
https://YOUR_USERNAME.github.io/ip-address-tracker/
```

Share this URL with anyone — no server or hosting subscription required!

---

### Updating Your Site

After making changes to any file:

```bash
git add .
git commit -m "Update: describe what you changed"
git push
```

GitHub Pages will automatically redeploy within ~60 seconds.

---

## Style Guide

| Property | Value |
|---|---|
| Font family | [Rubik](https://fonts.google.com/specimen/Rubik) |
| Font weights | 400 (regular), 500 (medium), 700 (bold) |
| Input font size | 18px |
| Very Dark Gray | `hsl(0, 0%, 17%)` |
| Dark Gray | `hsl(0, 0%, 59%)` |
| Mobile width | 375px |
| Desktop width | 1440px |

---

## Accessibility

- Semantic HTML5 (`<header>`, landmark roles)
- `aria-label` on all interactive elements and map
- `aria-live="assertive"` on the toast notification
- `role="alert"` for error messages
- Keyboard navigation: `Enter` to search, `Escape` to close history
- `:focus-visible` outlines on all buttons
- WCAG-compliant colour contrast on all text

---

## Built With

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure |
| CSS3 | Custom properties, Grid, Flexbox, animations |
| Vanilla JavaScript (ES5+) | All interactivity, API calls, map logic |
| [Leaflet.js 1.9.4](https://leafletjs.com) | Interactive map |
| [OpenStreetMap](https://www.openstreetmap.org) | Map tile data |
| [ip-api.com](https://ip-api.com) | IP geolocation |
| [Google Fonts — Rubik](https://fonts.google.com/specimen/Rubik) | Typography |

---

## Author

- Frontend Mentor — [@yourusername](https://www.frontendmentor.io/profile/yourusername)
- GitHub — [@yourusername](https://github.com/yourusername)

---

## License

MIT © 2025 — free to use, modify, and deploy.
