import { beforeEach, describe, it, expect } from 'vitest';
import { loadScript } from './test-helper.js';

describe('Pruebas Unitarias - Interfaz y UI (theme.js & modal.js)', () => {
  let isLoaded = false;

  beforeEach(() => {
    // Cada test parte sin preferencias persistidas para evitar contaminación entre casos.
    localStorage.clear();

    // Crear únicamente los nodos que theme.js y modal.js necesitan para trabajar.
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
      // Los scripts clásicos se cargan una vez y sus módulos quedan disponibles en window.
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
      // Inicializar el módulo para leer sus valores por defecto.
      window.ThemeModule.init();

      // Cambiar simultáneamente la apariencia y la densidad de la interfaz.
      window.ThemeModule.setMode('light');
      window.ThemeModule.setDensity('compact');

      // El módulo refleja las preferencias en atributos del elemento raíz.
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-density')).toBe('compact');

      // También conserva esas preferencias para futuras cargas de la aplicación.
      const savedPrefs = JSON.parse(localStorage.getItem('ics_theme_prefs'));
      expect(savedPrefs.mode).toBe('light');
      expect(savedPrefs.density).toBe('compact');
    });

    // Prueba 17: Apertura y cierre de modales
    it('Prueba 17: ModalManager debe registrar, abrir y cerrar modales manipulando la clase open', () => {
      const modalElement = document.getElementById('my-modal');

      // Asociar el identificador lógico con el elemento real del DOM.
      window.ModalManager.register('my-modal', modalElement);
      expect(window.ModalManager.isOpen('my-modal')).toBe(false);

      // Abrir bloquea el scroll y añade la clase visual open.
      window.ModalManager.open('my-modal');
      expect(window.ModalManager.isOpen('my-modal')).toBe(true);
      expect(modalElement.classList.contains('open')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      // Cerrar elimina la clase y devuelve el scroll del documento a su estado normal.
      window.ModalManager.close('my-modal');
      expect(window.ModalManager.isOpen('my-modal')).toBe(false);
      expect(modalElement.classList.contains('open')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    // Prueba 18: Notificaciones Toast
    it('Prueba 18: Toast debe insertar la alerta en el DOM con las clases visuales y estructura correctas', () => {
      const toastContainer = document.getElementById('toast-container');
      // Antes de mostrar la notificación, el contenedor debe estar vacío.
      expect(toastContainer.children.length).toBe(0);

      // Crear una notificación de éxito con su mensaje.
      window.Toast.show('Operación completada', 'success');

      // Comprobar que se creó un elemento, con clase de éxito y texto correcto.
      expect(toastContainer.children.length).toBe(1);
      const toastElement = toastContainer.querySelector('.toast');
      expect(toastElement.classList.contains('toast-success')).toBe(true);

      const msgElement = toastElement.querySelector('.toast-message');
      expect(msgElement.textContent).toBe('Operación completada');
    });
  });
});
