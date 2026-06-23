/* ============================================
   Modal System - Generic modal manager
   ============================================ */

const ModalManager = (() => {
  /** @type {Map<string, HTMLElement>} */
  const registeredModals = new Map();

  function register(modalId, backdropElement) {
    registeredModals.set(modalId, backdropElement);

    backdropElement.addEventListener('click', (event) => {
      if (event.target === backdropElement) {
        close(modalId);
      }
    });
  }

  function open(modalId) {
    const backdrop = registeredModals.get(modalId);
    if (!backdrop) return;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(modalId) {
    const backdrop = registeredModals.get(modalId);
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAll() {
    registeredModals.forEach((_, id) => close(id));
  }

  function isOpen(modalId) {
    const backdrop = registeredModals.get(modalId);
    return backdrop ? backdrop.classList.contains('open') : false;
  }

  // Global ESC key handler
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      registeredModals.forEach((backdrop, id) => {
        if (backdrop.classList.contains('open')) {
          close(id);
        }
      });
    }
  });

  return { register, open, close, closeAll, isOpen };
})();

/* ============================================
   Confirm Dialog
   ============================================ */

const ConfirmDialog = (() => {
  /**
   * @param {object} options
   * @param {string} options.title
   * @param {string} options.message
   * @param {string} [options.confirmText='Confirmar']
   * @param {string} [options.cancelText='Cancelar']
   * @param {string} [options.type='danger'] - danger | warning
   * @param {function} options.onConfirm
   */
  function show(options) {
    const {
      title = '¿Estás seguro?',
      message = 'Esta acción no se puede deshacer.',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      type = 'danger',
      onConfirm = () => {}
    } = options;

    const backdrop = document.getElementById('confirm-modal');
    const iconWrapper = backdrop.querySelector('.confirm-icon-wrapper');
    const titleEl = backdrop.querySelector('.confirm-title');
    const messageEl = backdrop.querySelector('.confirm-message');
    const confirmBtn = backdrop.querySelector('#confirm-action-btn');
    const cancelBtn = backdrop.querySelector('#confirm-cancel-btn');

    iconWrapper.className = `confirm-icon-wrapper ${type}`;
    iconWrapper.innerHTML = type === 'danger'
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    confirmBtn.className = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

    // Remove old listeners
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    const singleButton = options.singleButton || options.hideCancel || false;
    if (singleButton) {
      newCancel.style.display = 'none';
    } else {
      newCancel.style.display = '';
    }

    newConfirm.addEventListener('click', () => {
      onConfirm();
      ModalManager.close('confirm-modal');
    });

    newCancel.addEventListener('click', () => {
      ModalManager.close('confirm-modal');
    });

    ModalManager.open('confirm-modal');
  }

  return { show };
})();

/* ============================================
   Toast Notifications
   ============================================ */

const Toast = (() => {
  const container = () => document.getElementById('toast-container');

  /**
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration - ms
   */
  function show(message, type = 'info', duration = 3500) {
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => remove(toast));

    container().appendChild(toast);

    setTimeout(() => remove(toast), duration);
  }

  function remove(toast) {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  return { show };
})();
