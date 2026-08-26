/* ============================================
   App.js - Entry Point & Global State
   ============================================ */

/** Clave de almacenamiento para sincronizar tipos de evento con booking */
const EVENT_TYPES_STORAGE_KEY = 'ics_event_types';

/**
 * Carga los tipos de evento desde localStorage si existen,
 * con fallback a los datos iniciales de data.js.
 */
function loadEventTypes() {
  try {
    const saved = localStorage.getItem(EVENT_TYPES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error al cargar tipos de evento desde localStorage:', error);
  }
  return [...EVENT_TYPES_DATA];
}

/**
 * Persiste los tipos de evento actuales en localStorage
 * para que booking.html los consuma dinámicamente.
 */
function persistEventTypes() {
  try {
    localStorage.setItem(EVENT_TYPES_STORAGE_KEY, JSON.stringify(AppState.eventTypes));
  } catch (error) {
    console.error('Error al persistir tipos de evento:', error);
  }
}

/** Global Application State */
const AppState = {
  eventTypes: loadEventTypes(),
  currentUser: {
    name: 'Dr. Martínez',
    role: 'Administrador',
    initials: 'DM'
  }
};

/** Sidebar toggle */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('collapsed');
}

/** Initialize all modules */
document.addEventListener('DOMContentLoaded', () => {
  // Register modals
  const formModal = document.getElementById('form-modal');
  const confirmModal = document.getElementById('confirm-modal');
  if (formModal) ModalManager.register('form-modal', formModal);
  if (confirmModal) ModalManager.register('confirm-modal', confirmModal);

  // Init modules
  ThemeModule.init();
  TableModule.init();
  FormModule.init();
  TutorialModule.init();
  ShortcutsModule.init();

  // Persistir datos iniciales para sincronización con booking
  persistEventTypes();

  // New event button
  const newBtn = document.getElementById('btn-new-event');
  if (newBtn) newBtn.addEventListener('click', () => FormModule.openCreate());



  // Sidebar toggle
  const sideToggle = document.getElementById('sidebar-toggle');
  if (sideToggle) sideToggle.addEventListener('click', toggleSidebar);

  // Tutorial restart from sidebar
  const tutorialBtn = document.getElementById('btn-restart-tutorial');
  if (tutorialBtn) tutorialBtn.addEventListener('click', () => {
    TutorialModule.reset();
  });

  // Animate page load
  document.body.classList.add('loaded');
});
