/* ============================================
   Keyboard Shortcuts (R02NF)
   ============================================ */

const ShortcutsModule = (() => {
  function init() {
    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    // Ctrl+S / Cmd+S = Save (when form modal is open)
    if (isCtrlOrCmd && event.key === 's') {
      if (ModalManager.isOpen('form-modal')) {
        event.preventDefault();
        const submitBtn = document.getElementById('form-submit-btn');
        if (submitBtn) submitBtn.click();
      }
    }

    // Ctrl+N / Cmd+N = New event type
    if (isCtrlOrCmd && event.key === 'n') {
      if (!ModalManager.isOpen('form-modal')) {
        event.preventDefault();
        FormModule.openCreate();
      }
    }

    // Ctrl+F / Cmd+F = Focus search (only when no modal is open)
    if (isCtrlOrCmd && event.key === 'f') {
      if (!ModalManager.isOpen('form-modal') && !ModalManager.isOpen('confirm-modal')) {
        event.preventDefault();
        const search = document.getElementById('filter-search');
        if (search) search.focus();
      }
    }
  }

  return { init };
})();
