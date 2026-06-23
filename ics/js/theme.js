/* ============================================
   Theme Module - Personalization
   ============================================ */

const ThemeModule = (() => {
  const STORAGE_KEY = 'ics_theme_prefs';

  let prefs = {
    mode: 'dark',
    accent: '#3b82f6',
    density: 'normal',
    view: 'table'
  };

  function init() {
    loadPrefs();
    applyAll();
    bindEvents();
  }

  function loadPrefs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        prefs = { ...prefs, ...JSON.parse(saved) };
      }
    } catch (e) { /* ignore */ }
  }

  function savePrefs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }

  function applyAll() {
    applyMode();
    applyAccent();
    applyDensity();
    updateUI();
  }

  function applyMode() {
    if (prefs.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', prefs.mode === 'light' ? 'light' : '');
      if (prefs.mode === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }

  function applyAccent() {
    document.documentElement.style.setProperty('--theme-accent', prefs.accent);
    // Also update primary colors to match accent
    document.documentElement.style.setProperty('--color-primary-500', prefs.accent);
  }

  function applyDensity() {
    document.documentElement.setAttribute('data-density', prefs.density);
  }

  function setMode(mode) {
    prefs.mode = mode;
    applyMode();
    savePrefs();
    updateUI();
  }

  function setAccent(color) {
    prefs.accent = color;
    applyAccent();
    savePrefs();
    updateUI();
  }

  function setDensity(density) {
    prefs.density = density;
    applyDensity();
    savePrefs();
    updateUI();
  }

  function togglePanel() {
    const panel = document.getElementById('theme-panel');
    if (panel) panel.classList.toggle('open');
  }

  function closePanel() {
    const panel = document.getElementById('theme-panel');
    if (panel) panel.classList.remove('open');
  }

  function updateUI() {
    // Mode buttons
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === prefs.mode);
    });

    // Accent swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.classList.toggle('active', swatch.dataset.color === prefs.accent);
    });

    // Density buttons
    document.querySelectorAll('.density-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.density === prefs.density);
    });
  }

  function bindEvents() {
    // Theme toggle button
    const toggleBtn = document.getElementById('btn-theme');
    if (toggleBtn) toggleBtn.addEventListener('click', togglePanel);

    // Close panel
    const closeBtn = document.getElementById('theme-panel-close');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Mode buttons
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Accent swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => setAccent(swatch.dataset.color));
    });

    // Density buttons
    document.querySelectorAll('.density-btn').forEach(btn => {
      btn.addEventListener('click', () => setDensity(btn.dataset.density));
    });

    // Auto mode listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (prefs.mode === 'auto') applyMode();
    });
  }

  return { init, togglePanel, closePanel, setMode, setAccent, setDensity };
})();
