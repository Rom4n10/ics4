/* ============================================
   App.js - Entry Point & Global State
   ============================================ */

/** Global Application State */
const AppState = {
  eventTypes: [...EVENT_TYPES_DATA],
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
