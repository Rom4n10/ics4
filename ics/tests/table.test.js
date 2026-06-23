import { beforeEach, describe, it, expect, vi } from 'vitest';
import { loadScript } from './test-helper.js';

describe('Pruebas Unitarias - Listado y Filtros (table.js)', () => {
  let isLoaded = false;

  beforeEach(() => {
    // Configurar el DOM mínimo necesario para TableModule
    document.body.innerHTML = `
      <input type="text" id="filter-search" />
      <select id="filter-status">
        <option value="all">Todos</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
      </select>
      <select id="filter-duration">
        <option value="all">Todas</option>
        <option value="15">15 min</option>
        <option value="30">30 min</option>
        <option value="45">45 min</option>
        <option value="60">60 min</option>
        <option value="custom">Personalizada</option>
      </select>
      <input type="date" id="filter-date-from" />
      <input type="date" id="filter-date-to" />
      <span id="results-count"></span>
      <div id="events-container"></div>
    `;

    // Mock de AppState para aislar la prueba de los datos reales del archivo
    window.AppState = {
      eventTypes: [
        {
          id: 'evt-001',
          name: 'Consulta General',
          description: 'Consulta médica general para evaluación de síntomas.',
          duration: 30,
          modality: 'presencial',
          confirmation: 'auto',
          status: 'active',
          createdAt: '2026-01-15T10:30:00'
        },
        {
          id: 'evt-002',
          name: 'Teleconsulta',
          description: 'Consulta médica virtual a través de videollamada.',
          duration: 15,
          modality: 'virtual',
          confirmation: 'auto',
          status: 'active',
          createdAt: '2026-02-01T09:00:00'
        },
        {
          id: 'evt-003',
          name: 'Revisión de Estudios',
          description: 'Evaluación de laboratorios e imágenes.',
          duration: 30,
          modality: 'virtual',
          confirmation: 'auto',
          status: 'inactive',
          createdAt: '2026-01-10T13:00:00'
        }
      ]
    };

    window.DURATION_PRESETS = [15, 30, 45, 60];

    // Mock de módulos y funciones auxiliares no testeados en esta suite
    window.FormModule = {
      openEdit: vi.fn(),
      openDuplicate: vi.fn(),
    };
    window.ConfirmDialog = {
      show: vi.fn(),
    };
    window.Toast = {
      show: vi.fn(),
    };

    if (!isLoaded) {
      // Cargar table.js expuesto globalmente una sola vez
      loadScript('js/table.js', ['TableModule']);
      isLoaded = true;
    }

    // Inicializar el módulo para enlazar los eventos y resetear filtros para evitar estado compartido
    window.TableModule.init();
    window.TableModule.clearFilters();
  });

  // ============================================
  //  INTEGRANTE 5: ADMINISTRACIÓN Y FILTROS
  // ============================================
  describe('Integrante 5: Filtros del Panel de Administración', () => {
    it('Prueba 13: Búsqueda de eventos por texto debe filtrar filas coincidentes', () => {
      const searchInput = document.getElementById('filter-search');

      // Escribir en el campo de búsqueda
      searchInput.value = 'médica';
      searchInput.dispatchEvent(new Event('input'));

      // Verificar que se listan solo los que coinciden con "médica" (Consulta General y Teleconsulta)
      const container = document.getElementById('events-container');
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
      expect(rows[0].querySelector('.event-name').textContent).toBe('Consulta General');
      expect(rows[1].querySelector('.event-name').textContent).toBe('Teleconsulta');

      // Probar búsqueda por coincidencia vacía (debe mostrar todos)
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      expect(container.querySelectorAll('tbody tr').length).toBe(3);
    });

    it('Prueba 14: Filtro de estado debe visualizar solo los eventos que coincidan', () => {
      const statusSelect = document.getElementById('filter-status');

      // Filtrar por inactivos
      statusSelect.value = 'inactive';
      statusSelect.dispatchEvent(new Event('change'));

      const container = document.getElementById('events-container');
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].querySelector('.event-name').textContent).toBe('Revisión de Estudios');

      // Filtrar por activos
      statusSelect.value = 'active';
      statusSelect.dispatchEvent(new Event('change'));
      expect(container.querySelectorAll('tbody tr').length).toBe(2);
    });

    it('Prueba 15: Filtro de duración debe mostrar los eventos de la duración correspondiente', () => {
      const durationSelect = document.getElementById('filter-duration');

      // Filtrar por 15 minutos
      durationSelect.value = '15';
      durationSelect.dispatchEvent(new Event('change'));

      const container = document.getElementById('events-container');
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].querySelector('.event-name').textContent).toBe('Teleconsulta');

      // Filtrar por 30 minutos (deben ser 2: Consulta General y Revisión de Estudios)
      durationSelect.value = '30';
      durationSelect.dispatchEvent(new Event('change'));
      expect(container.querySelectorAll('tbody tr').length).toBe(2);
    });
  });
});
