import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { vi } from 'vitest';

// Mocks para entornos de navegador faltantes en JSDOM
if (typeof window !== 'undefined') {
  // Mock de matchMedia
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  // Mock de scrollTo
  if (!window.scrollTo) {
    window.scrollTo = vi.fn();
  }
}

/**
 * Carga un script clásico de JS en el contexto actual de JSDOM.
 * Opcionalmente expone las constantes/variables locales al objeto window global.
 * @param {string} relativePath - Ruta al archivo JS relativo a la raíz del proyecto
 * @param {string[]} globalsToExpose - Nombres de variables a vincular a window
 */
export function loadScript(relativePath, globalsToExpose = []) {
  const filePath = path.resolve(__dirname, '..', relativePath);
  let code = fs.readFileSync(filePath, 'utf8');

  // Agregar la vinculación explícita al objeto window
  globalsToExpose.forEach(name => {
    code += `\nwindow.${name} = ${name};`;
  });

  // Ejecutar el script en el contexto actual de la suite de pruebas
  vm.runInThisContext(code, { filename: filePath });
}

/**
 * Dispara el evento DOMContentLoaded en el documento para ejecutar las funciones de inicialización.
 */
export function triggerDOMContentLoaded() {
  const event = new window.Event('DOMContentLoaded', {
    bubbles: true,
    cancelable: true,
  });
  window.document.dispatchEvent(event);
}
