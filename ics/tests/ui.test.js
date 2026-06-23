import { beforeEach, describe, it, expect, vi } from 'vitest';
import { loadScript } from './test-helper.js';

describe('Pruebas Unitarias - Interfaz y UI (theme.js & modal.js)', () => {
  let isLoaded = false;

  beforeEach(() => {
    // Configurar localStorage vacío
    localStorage.clear();

    // Estructura DOM requerida para modales, temas y toasts
    document.body.innerHTML = `
      <button id="btn-theme"></button>
      <button id="theme-panel-close"></button>
      <div id="theme-panel"></div>
      <div id="my-modal" class="modal-backdrop"></div>
      <div id="toast-container"></div>
      
      <!-- Controles de tema -->
      <button class="theme-mode-btn" data-mode="light"></button>
      <button class="theme-mode-btn" data-mode="dark"></button>
      <button class="theme-mode-btn" data-mode="auto"></button>
      
      <button class="color-swatch" data-color="#3b82f6"></button>
      
      <button class="density-btn" data-density="compact"></button>
      <button class="density-btn" data-density="normal"></button>
    `;

    if (!isLoaded) {
      // Cargar los scripts clásicos exponiendo los módulos a testear una sola vez
      loadScript('js/theme.js', ['ThemeModule']);
      loadScript('js/modal.js', ['ModalManager', 'Toast']);
      isLoaded = true;
    }
  });

  // ============================================
  //  INTEGRANTE 6: PERSONALIZACIÓN Y CONTROL DEL DOM
  // ============================================
  describe('Integrante 6: Temas, Modales y Notificaciones', () => {

    // Prueba 16: Guardado de preferencias de tema
    it('Prueba 16: ThemeModule debe aplicar el tema y guardar las preferencias en localStorage', () => {
      window.ThemeModule.init();

      // Cambiar modo a Light y densidad a Compact
      window.ThemeModule.setMode('light');
      window.ThemeModule.setDensity('compact');

      // Verificar cambios en el DOM
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-density')).toBe('compact');

      // Verificar persistencia en localStorage
      const savedPrefs = JSON.parse(localStorage.getItem('ics_theme_prefs'));
      expect(savedPrefs.mode).toBe('light');
      expect(savedPrefs.density).toBe('compact');
    });

    // Prueba 17: Apertura y cierre de modales
    it('Prueba 17: ModalManager debe registrar, abrir y cerrar modales manipulando la clase open', () => {
      const modalElement = document.getElementById('my-modal');

      // Registrar modal
      window.ModalManager.register('my-modal', modalElement);
      expect(window.ModalManager.isOpen('my-modal')).toBe(false);

      // Abrir modal
      window.ModalManager.open('my-modal');
      expect(window.ModalManager.isOpen('my-modal')).toBe(true);
      expect(modalElement.classList.contains('open')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      // Cerrar modal
      window.ModalManager.close('my-modal');
      expect(window.ModalManager.isOpen('my-modal')).toBe(false);
      expect(modalElement.classList.contains('open')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    // Prueba 18: Notificaciones Toast
    it('Prueba 18: Toast debe insertar la alerta en el DOM con las clases visuales y estructura correctas', () => {
      const toastContainer = document.getElementById('toast-container');
      expect(toastContainer.children.length).toBe(0);

      // Desplegar un toast de éxito
      window.Toast.show('Operación completada', 'success');

      // Verificar estructura en el DOM
      expect(toastContainer.children.length).toBe(1);
      const toastElement = toastContainer.querySelector('.toast');
      expect(toastElement.classList.contains('toast-success')).toBe(true);

      const msgElement = toastElement.querySelector('.toast-message');
      expect(msgElement.textContent).toBe('Operación completada');
    });
  });
});
