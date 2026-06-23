/* ============================================
   Table Module - Render, Filter, Search
   ============================================ */

const TableModule = (() => {
  let currentView = 'table'; // 'table' | 'grid'
  let filters = {
    search: '',
    status: 'all',
    duration: 'all',
    dateFrom: '',
    dateTo: ''
  };

  function init() {
    bindFilterEvents();
    bindViewToggle();
    render();
  }

  function getFilteredData() {
    return AppState.eventTypes.filter(event => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesName = event.name.toLowerCase().includes(q);
        const matchesDesc = event.description && event.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      // Status filter
      if (filters.status !== 'all' && event.status !== filters.status) return false;
      // Duration filter
      if (filters.duration !== 'all') {
        if (filters.duration === 'custom') {
          if (DURATION_PRESETS.includes(event.duration)) return false;
        } else {
          if (event.duration !== parseInt(filters.duration)) return false;
        }
      }
      // Date filter
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(event.createdAt) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59);
        if (new Date(event.createdAt) > to) return false;
      }
      return true;
    });
  }

  function render() {
    const data = getFilteredData();
    updateResultCount(data.length);

    if (currentView === 'table') {
      renderTable(data);
    } else {
      renderGrid(data);
    }
  }

  function renderTable(data) {
    const container = document.getElementById('events-container');
    if (data.length === 0) {
      container.innerHTML = renderEmptyState();
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Duración</th>
              <th>Modalidad</th>
              <th>Confirmación</th>
              <th>Estado</th>
              <th>Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody class="stagger-children">
            ${data.map(event => renderTableRow(event)).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindRowActions();
  }

  function renderTableRow(event) {
    const durationLabel = event.duration >= 60
      ? `${event.duration / 60} hr`
      : `${event.duration} min`;

    const modalityLabels = {
      presencial: 'Presencial',
      virtual: 'Virtual',
      ambas: 'Ambas'
    };

    const confirmLabels = {
      auto: 'Automática',
      manual: 'Manual'
    };

    return `
      <tr data-id="${event.id}">
        <td>
          <div class="cell-name">
            <span class="event-name">${escapeHtml(event.name)}</span>
            ${event.description ? `<span class="event-desc">${escapeHtml(event.description)}</span>` : ''}
          </div>
        </td>
        <td>
          <div class="cell-duration">
            <svg class="duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${durationLabel}
          </div>
        </td>
        <td><span class="badge badge-${event.modality}">${modalityLabels[event.modality]}</span></td>
        <td><span class="badge badge-${event.confirmation}">${confirmLabels[event.confirmation]}</span></td>
        <td><span class="badge badge-${event.status}"><span class="badge-dot"></span>${event.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
        <td><span class="cell-date">${formatDate(event.createdAt)}</span></td>
        <td>
          <div class="cell-actions">
            <button class="btn btn-ghost btn-icon btn-sm" title="Editar" data-action="edit" data-id="${event.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-icon btn-sm" title="Duplicar" data-action="duplicate" data-id="${event.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button class="btn btn-ghost btn-icon btn-sm ${event.status === 'inactive' ? '' : 'danger-hover'}" title="${event.status === 'active' ? 'Dar de baja' : 'Reactivar'}" data-action="toggle-status" data-id="${event.id}">
              ${event.status === 'active'
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderGrid(data) {
    const container = document.getElementById('events-container');
    if (data.length === 0) {
      container.innerHTML = renderEmptyState();
      return;
    }

    container.innerHTML = `
      <div class="events-grid stagger-children">
        ${data.map(event => renderGridCard(event)).join('')}
      </div>
    `;
    bindRowActions();
  }

  function renderGridCard(event) {
    const durationLabel = event.duration >= 60
      ? `${event.duration / 60} hr`
      : `${event.duration} min`;
    const modalityLabels = { presencial: 'Presencial', virtual: 'Virtual', ambas: 'Ambas' };
    const confirmLabels = { auto: 'Automática', manual: 'Manual' };

    return `
      <div class="event-card" data-id="${event.id}">
        <div class="event-card-header">
          <span class="badge badge-${event.status}"><span class="badge-dot"></span>${event.status === 'active' ? 'Activo' : 'Inactivo'}</span>
          <div class="cell-actions">
            <button class="btn btn-ghost btn-icon btn-sm" title="Editar" data-action="edit" data-id="${event.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-icon btn-sm" title="Duplicar" data-action="duplicate" data-id="${event.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </div>
        <h3 class="event-card-title">${escapeHtml(event.name)}</h3>
        ${event.description ? `<p class="event-card-desc">${escapeHtml(event.description)}</p>` : ''}
        <div class="event-card-meta">
          <span class="badge badge-${event.modality}">${modalityLabels[event.modality]}</span>
          <span class="badge badge-${event.confirmation}">${confirmLabels[event.confirmation]}</span>
        </div>
        <div class="event-card-footer">
          <div class="cell-duration">
            <svg class="duration-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${durationLabel}
          </div>
          <span class="cell-date">${formatDate(event.createdAt)}</span>
        </div>
      </div>
    `;
  }

  function renderEmptyState() {
    return `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h3 class="empty-state-title">Sin resultados</h3>
        <p class="empty-state-text">No se encontraron tipos de evento con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.</p>
        <button class="btn btn-secondary" onclick="TableModule.clearFilters()">Limpiar Filtros</button>
      </div>
    `;
  }

  function updateResultCount(count) {
    const el = document.getElementById('results-count');
    if (el) {
      const total = AppState.eventTypes.length;
      el.innerHTML = `Mostrando <strong>${count}</strong> de <strong>${total}</strong> tipos de evento`;
    }
  }

  function bindFilterEvents() {
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value;
        render();
      });
    }

    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        filters.status = e.target.value;
        render();
      });
    }

    const durationSelect = document.getElementById('filter-duration');
    if (durationSelect) {
      durationSelect.addEventListener('change', (e) => {
        filters.duration = e.target.value;
        render();
      });
    }

    const dateFrom = document.getElementById('filter-date-from');
    if (dateFrom) {
      dateFrom.addEventListener('change', (e) => {
        filters.dateFrom = e.target.value;
        render();
      });
    }

    const dateTo = document.getElementById('filter-date-to');
    if (dateTo) {
      dateTo.addEventListener('change', (e) => {
        filters.dateTo = e.target.value;
        render();
      });
    }
  }

  function bindViewToggle() {
    const btns = document.querySelectorAll('.view-toggle-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  function bindRowActions() {
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        FormModule.openEdit(id);
      });
    });

    document.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const event = AppState.eventTypes.find(ev => ev.id === id);
        if (event) {
          FormModule.openDuplicate(event);
        }
      });
    });

    document.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const event = AppState.eventTypes.find(ev => ev.id === id);
        if (!event) return;

        if (event.status === 'active') {
          ConfirmDialog.show({
            title: '¿Dar de baja este tipo de evento?',
            message: `El tipo de evento "${event.name}" será desactivado y no aparecerá en la agenda. Podrás reactivarlo en cualquier momento.`,
            confirmText: 'Dar de Baja',
            type: 'danger',
            onConfirm: () => {
              event.status = 'inactive';
              event.updatedAt = new Date().toISOString();
              render();
              Toast.show('baja confirmada', 'success');
            }
          });
        } else {
          event.status = 'active';
          event.updatedAt = new Date().toISOString();
          render();
          Toast.show(`"${event.name}" reactivado correctamente`, 'success');
        }
      });
    });

    // Grid card click = edit
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.cell-actions')) return;
        FormModule.openEdit(card.dataset.id);
      });
    });
  }

  function clearFilters() {
    filters = { search: '', status: 'all', duration: 'all', dateFrom: '', dateTo: '' };
    const s = document.getElementById('filter-search');
    if (s) s.value = '';
    const st = document.getElementById('filter-status');
    if (st) st.value = 'all';
    const d = document.getElementById('filter-duration');
    if (d) d.value = 'all';
    const df = document.getElementById('filter-date-from');
    if (df) df.value = '';
    const dt = document.getElementById('filter-date-to');
    if (dt) dt.value = '';
    render();
  }

  return { init, render, clearFilters };
})();

/* === Helpers === */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generateId() {
  return 'evt-' + Math.random().toString(36).substring(2, 9);
}
