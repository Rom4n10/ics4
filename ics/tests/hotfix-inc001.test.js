// INC-001 (M03 Tipos de Evento): editar un tipo con confirmación automática
// lo pasaba a confirmación manual. Este test usa el form.js real (no una copia)
// para proteger contra la regresión.
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { loadScript } from './test-helper.js';

const FORM_DOM = `
  <h2 id="form-modal-title"></h2>
  <button id="form-submit-btn"></button>
  <input id="field-name" class="form-input">
  <textarea id="field-description" class="form-input"></textarea>
  <span id="desc-char-counter"><span id="desc-char-count"></span></span>
  <button class="duration-pill" data-duration="15"></button>
  <button class="duration-pill" data-duration="30"></button>
  <button class="duration-pill" data-duration="45"></button>
  <button class="duration-pill" data-duration="custom"></button>
  <div id="custom-duration-group"><input id="custom-duration-input"></div>
  <div class="modality-card" data-modality="presencial"></div>
  <div class="modality-card" data-modality="virtual"></div>
  <input type="checkbox" id="confirmation-toggle">
  <span id="confirmation-label"></span>
  <div id="upload-preview"></div>
`;

function makeEvent(overrides = {}) {
  return {
    id: 'evt-test-auto',
    name: 'Consulta Automática',
    description: 'Tipo con confirmación automática',
    duration: 30,
    modality: 'presencial',
    confirmation: 'auto',
    status: 'active',
    ...overrides,
  };
}

describe('INC-001 - Edición de tipo de evento conserva la confirmación (M03)', () => {
  let isLoaded = false;

  beforeEach(() => {
    document.body.innerHTML = FORM_DOM;

    // Dependencias globales que form.js espera encontrar en el navegador.
    globalThis.AppState = {
      eventTypes: [makeEvent(), makeEvent({ id: 'evt-test-manual', name: 'Cirugía', confirmation: 'manual' })],
    };
    globalThis.DURATION_PRESETS = [15, 30, 45, 60];
    globalThis.generateId = () => 'evt-new';
    globalThis.persistEventTypes = vi.fn();
    globalThis.ModalManager = { open: vi.fn(), close: vi.fn() };
    globalThis.Toast = { show: vi.fn() };
    globalThis.TableModule = { render: vi.fn() };
    globalThis.TutorialModule = { start: vi.fn() };

    if (!isLoaded) {
      loadScript('js/form.js', ['FormModule']);
      isLoaded = true;
    }
    // init() registra listeners sobre el DOM recién creado en cada test.
    window.FormModule.init();
  });

  function editar(id, { nombre, duracion } = {}) {
    window.FormModule.openEdit(id);
    if (nombre) document.getElementById('field-name').value = nombre;
    if (duracion) document.querySelector(`.duration-pill[data-duration="${duracion}"]`).click();
    document.getElementById('form-submit-btn').click();
  }

  it('al cambiar el nombre de un tipo automático, sigue siendo automático', () => {
    editar('evt-test-auto', { nombre: 'Consulta Renombrada' });

    const evento = globalThis.AppState.eventTypes.find((e) => e.id === 'evt-test-auto');
    expect(evento.name).toBe('Consulta Renombrada');
    expect(evento.confirmation).toBe('auto');
  });

  it('al cambiar la duración de un tipo automático, sigue siendo automático', () => {
    editar('evt-test-auto', { duracion: 45 });

    const evento = globalThis.AppState.eventTypes.find((e) => e.id === 'evt-test-auto');
    expect(evento.duration).toBe(45);
    expect(evento.confirmation).toBe('auto');
  });

  it('un tipo manual sigue siendo manual tras editarlo', () => {
    editar('evt-test-manual', { nombre: 'Cirugía Renombrada' });

    const evento = globalThis.AppState.eventTypes.find((e) => e.id === 'evt-test-manual');
    expect(evento.confirmation).toBe('manual');
  });
});
