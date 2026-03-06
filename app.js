/* ═══════════════════════════════════════════════════════════════
   IP ADDRESS TRACKER — app.js
   APIs used:
     • ip-api.com   — free IP geolocation (no key required, 45 req/min)
     • Leaflet 1.9  — interactive map (loaded via CDN in index.html)
     • OpenStreetMap — map tile provider
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Module-level state ─────────────────────────────────────── */
var map          = null;
var marker       = null;
var toastTimer   = null;
var currentData  = null;        // last successful API response
var searchHistory = [];

/* Persist recent searches across sessions */
try {
  searchHistory = JSON.parse(localStorage.getItem('ip-tracker-history') || '[]');
} catch (e) {
  searchHistory = [];
}

/* ════════════════════════════════════════════════════════════════
   MAP
════════════════════════════════════════════════════════════════ */

/**
 * Initialise Leaflet map with OpenStreetMap tiles.
 * Zoom control is placed bottom-right to avoid overlapping the info card.
 */
function initMap() {
  map = L.map('map', {
    center         : [20, 0],
    zoom           : 2,
    zoomControl    : false,      // we re-add it bottom-right below
    attributionControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom     : 19
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
}

/**
 * Build the custom dark pin icon using Leaflet's DivIcon.
 * The pin is rotated 45° and styled to match the design.
 * @returns {L.DivIcon}
 */
function buildPinIcon() {
  return L.divIcon({
    className : '',       // no default Leaflet class styles
    html      :
      '<div style="display:flex;flex-direction:column;align-items:center;">'
    +   '<div style="'
    +     'width:46px;height:46px;'
    +     'background:hsl(0,0%,17%);'
    +     'border-radius:50% 50% 50% 0;'
    +     'transform:rotate(-45deg);'
    +     'border:5px solid #fff;'
    +     'box-shadow:0 8px 24px rgba(0,0,0,.3);'
    +     'display:flex;align-items:center;justify-content:center;'
    +     'position:relative;'
    +   '">'
    +     '<div style="'
    +       'width:14px;height:14px;'
    +       'background:#fff;'
    +       'border-radius:50%;'
    +       'position:absolute;top:50%;left:50%;'
    +       'transform:translate(-50%,-50%);'
    +     '"></div>'
    +   '</div>'
    +   '<div style="'
    +     'width:3px;height:14px;'
    +     'background:hsl(0,0%,17%);'
    +     'margin-top:-2px;'
    +     'border-radius:0 0 3px 3px;'
    +   '"></div>'
    + '</div>',
    iconSize   : [46, 64],
    iconAnchor : [23, 64]        // tip of pin at the coordinate
  });
}

/**
 * Remove the old marker (if any) and place a new one,
 * then animate the map to fly to the new location.
 * @param {number} lat
 * @param {number} lng
 */
function placeMarker(lat, lng) {
  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng], { icon: buildPinIcon() }).addTo(map);
  map.flyTo([lat, lng], 13, { duration: 1.8, easeLinearity: 0.35 });
}

/* ════════════════════════════════════════════════════════════════
   IP GEOLOCATION API
════════════════════════════════════════════════════════════════ */

/**
 * Fetch geolocation data for a given IP/domain query.
 * If query is empty the API auto-detects the caller's IP.
 * @param {string} [query=''] — IP address, domain, or '' for self
 */
function fetchIP(query) {
  query = (query || '').trim();
  setLoading(true);
  closeHistory();

  var fields = 'status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,query';
  var url    = query
    ? 'https://ip-api.com/json/' + encodeURIComponent(query) + '?fields=' + fields
    : 'https://ip-api.com/json/?fields=' + fields;

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('Network error ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (data.status === 'fail') {
        throw new Error(data.message || 'Invalid IP or domain');
      }
      currentData = data;
      renderCard(data);
      placeMarker(data.lat, data.lon);
      if (query) pushHistory(query);
    })
    .catch(function (err) {
      var msg = (err.message && err.message.length < 80)
        ? err.message
        : 'Could not locate that IP or domain.';
      showToast(msg, 'error');
      setLoading(false);
    });
}

/* ════════════════════════════════════════════════════════════════
   CARD RENDERING
════════════════════════════════════════════════════════════════ */

/**
 * Populate all four info-card cells with data from the API response.
 * Also re-triggers the card entrance animation.
 * @param {Object} data — ip-api response object
 */
function renderCard(data) {
  setLoading(false);

  var location =
    [data.city, data.regionName, data.zip]
      .filter(Boolean)
      .join(', ')
    + (data.country ? ', ' + data.country : '');

  animateValue('val-ip',  data.query  || '—');
  animateValue('val-loc', location    || '—');
  animateValue('val-tz',  'UTC ' + getUTCOffset(data.timezone));
  animateValue('val-isp', data.isp || data.org || '—');

  /* Re-play card entrance animation */
  var card = document.getElementById('info-card');
  card.style.animation = 'none';
  card.offsetHeight;           // force reflow to restart animation
  card.style.animation = 'cardFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards';
}

/**
 * Fade a value element from skeleton → actual text with a slide-up effect.
 * @param {string} id   — element id
 * @param {string} text — display text
 */
function animateValue(id, text) {
  var el = document.getElementById(id);
  el.classList.remove('skeleton');
  el.style.transition = 'opacity 0.3s, transform 0.3s';
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(6px)';
  el.textContent      = text;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Calculate a formatted UTC offset string (e.g. "+05:30") for a given
 * IANA timezone identifier using the browser's Intl API.
 * @param {string} tz — IANA timezone, e.g. "America/New_York"
 * @returns {string}
 */
function getUTCOffset(tz) {
  try {
    var now   = new Date();
    var local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    var utc   = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    var diff  = (local - utc) / 3600000;
    var sign  = diff >= 0 ? '+' : '-';
    var h     = Math.floor(Math.abs(diff));
    var m     = Math.round((Math.abs(diff) - h) * 60);
    return sign + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  } catch (e) {
    return '±00:00';
  }
}

/* ════════════════════════════════════════════════════════════════
   LOADING STATE
════════════════════════════════════════════════════════════════ */

/**
 * Toggle skeleton loaders and disable/enable inputs.
 * @param {boolean} on
 */
function setLoading(on) {
  document.getElementById('search-btn').disabled   = on;
  document.getElementById('search-input').disabled = on;

  if (on) {
    ['val-ip', 'val-loc', 'val-tz', 'val-isp'].forEach(function (id) {
      var el = document.getElementById(id);
      el.classList.add('skeleton');
      el.textContent = '\u00a0';   // non-breaking space keeps height
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   SEARCH HISTORY
════════════════════════════════════════════════════════════════ */

/**
 * Add a query to the start of history (max 6 items, no duplicates).
 * Persists to localStorage.
 * @param {string} q
 */
function pushHistory(q) {
  searchHistory = [q]
    .concat(searchHistory.filter(function (h) { return h !== q; }))
    .slice(0, 6);
  try {
    localStorage.setItem('ip-tracker-history', JSON.stringify(searchHistory));
  } catch (e) { /* storage may be unavailable */ }
}

/** Render and show the history dropdown. */
function openHistory() {
  if (!searchHistory.length) return;

  var list = document.getElementById('history-list');
  list.innerHTML = searchHistory.map(function (h) {
    return '<div class="history-item" data-q="' + encodeURIComponent(h) + '">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
      + '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
      + escapeHTML(h)
      + '</div>';
  }).join('');

  list.querySelectorAll('.history-item').forEach(function (el) {
    el.addEventListener('click', function () {
      var q = decodeURIComponent(el.getAttribute('data-q'));
      document.getElementById('search-input').value = q;
      fetchIP(q);
    });
  });

  document.getElementById('history-dropdown').classList.add('open');
}

/** Hide the history dropdown. */
function closeHistory() {
  document.getElementById('history-dropdown').classList.remove('open');
}

/**
 * Minimal HTML escaper to prevent XSS when injecting history items.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════════════════════════ */

/**
 * Show a temporary toast message at the bottom of the screen.
 * @param {string} msg        — text to display
 * @param {string} [type=''] — 'success' | 'error' | ''
 */
function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    t.classList.remove('show');
  }, 3000);
}

/* ════════════════════════════════════════════════════════════════
   CLIPBOARD COPY (on info cell click)
════════════════════════════════════════════════════════════════ */
document.querySelectorAll('[data-copyable]').forEach(function (cell) {
  cell.addEventListener('click', function () {
    var text = cell.querySelector('.info-value').textContent.trim();
    if (!text || text === '—') return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(function () {
          cell.classList.add('copied');
          setTimeout(function () { cell.classList.remove('copied'); }, 1400);
          showToast('Copied to clipboard!', 'success');
        })
        .catch(function () { showToast('Copy failed', 'error'); });
    }
  });
});

/* ════════════════════════════════════════════════════════════════
   SHARE BUTTON
════════════════════════════════════════════════════════════════ */
document.getElementById('share-btn').addEventListener('click', function () {
  if (!currentData) return;
  var shareURL = location.origin + location.pathname + '?q=' + encodeURIComponent(currentData.query);

  if (navigator.share) {
    navigator.share({ title: 'IP Address Tracker', url: shareURL }).catch(function () {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareURL).then(function () {
      showToast('Link copied to clipboard!', 'success');
    });
  }
});

/* ════════════════════════════════════════════════════════════════
   LOCATE MY IP BUTTON
════════════════════════════════════════════════════════════════ */
document.getElementById('locate-btn').addEventListener('click', function () {
  document.getElementById('search-input').value = '';
  fetchIP('');
});

/* ════════════════════════════════════════════════════════════════
   SEARCH
════════════════════════════════════════════════════════════════ */

/** Trigger a search with the current input value. */
function doSearch() {
  closeHistory();
  fetchIP(document.getElementById('search-input').value);
}

document.getElementById('search-btn').addEventListener('click', doSearch);

document.getElementById('search-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter')  doSearch();
  if (e.key === 'Escape') closeHistory();
});

document.getElementById('search-input').addEventListener('focus', openHistory);

/* Close history when clicking outside the search wrapper */
document.addEventListener('click', function (e) {
  if (!document.getElementById('search-wrap').contains(e.target)) {
    closeHistory();
  }
});

/* ── History clear button ─────────────────────────────────── */
document.getElementById('history-clear').addEventListener('click', function () {
  searchHistory = [];
  try { localStorage.removeItem('ip-tracker-history'); } catch (e) {}
  closeHistory();
});

document.getElementById('history-clear').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') this.click();
});

/* ════════════════════════════════════════════════════════════════
   BOOT — runs once on page load
════════════════════════════════════════════════════════════════ */
(function boot() {
  initMap();

  /* Support shareable URLs: ?q=8.8.8.8 */
  var qParam = new URLSearchParams(location.search).get('q');

  if (qParam) {
    document.getElementById('search-input').value = qParam;
    fetchIP(qParam);
  } else {
    fetchIP('');   /* auto-detect visitor's own IP */
  }
})();
