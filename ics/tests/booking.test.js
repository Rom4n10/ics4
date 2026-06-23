import { beforeEach, describe, it, expect, vi } from 'vitest';
import { loadScript } from './test-helper.js';

describe('Pruebas Unitarias - Módulo de Reserva (booking.js)', () => {
  let isLoaded = false;

  beforeEach(() => {
    // Limpiar y preparar el DOM básico
    document.body.innerHTML = `
      <div id="booking-stepper"></div>
      <div id="event-types-list"></div>
      <div id="calendar-widget"></div>
      <div id="calendar-month-label"></div>
      <button id="calendar-prev"></button>
      <div id="calendar-days"></div>
      <div id="time-slots-container"></div>
      <input id="guest-fullname" />
      <input id="guest-email" />
      <input id="guest-phone" />
      <input id="guest-note" />
      <div id="booking-toast-container"></div>
      <button id="btn-back"></button>
      <button id="btn-next"></button>
      <div id="confirm-modal" class="modal-backdrop">
        <div class="confirm-icon-wrapper"></div>
        <div class="confirm-title"></div>
        <div class="confirm-message"></div>
        <button id="confirm-action-btn"></button>
        <button id="confirm-cancel-btn"></button>
      </div>
    `;

    // Mock de ConfirmDialog para evitar dependencias
    window.ConfirmDialog = {
      show: vi.fn(),
    };

    if (!isLoaded) {
      // Cargar las funciones y variables globales de booking.js expuestas al contexto una sola vez
      loadScript('js/booking.js', [
        'BookingState',
        'BOOKING_CONFIG',
        'BOOKING_EVENT_TYPES',
        'MOCK_BOOKED_SLOTS',
        'formatDateKey',
        'formatTime12h',
        'capitalize',
        'isFormValid',
        'isDateBlocked',
        'generateTimeSlots',
        'findNearestSuggestions',
      ]);
      isLoaded = true;
    }

    // Resetear el estado para cada test
    if (window.BookingState) {
      window.BookingState.currentStep = 1;
      window.BookingState.selectedEventType = null;
      window.BookingState.selectedDate = null;
      window.BookingState.selectedSlot = null;
      window.BookingState.guestData = { fullName: '', email: '', phone: '', note: '' };
    }
  });

  // ============================================
  // 🧑‍💻 INTEGRANTE 1: GESTIÓN DE HORARIOS Y FECHAS
  // ============================================
  describe('Integrante 1: Utilidades de fecha y hora', () => {
    it('Prueba 1: formatDateKey debe formatear una fecha como YYYY-MM-DD', () => {
      const date = new Date(2026, 3, 9); // 9 de abril de 2026
      expect(window.formatDateKey(date)).toBe('2026-04-09');

      const date2 = new Date(2026, 11, 25); // 25 de diciembre de 2026
      expect(window.formatDateKey(date2)).toBe('2026-12-25');
    });

    it('Prueba 2: formatTime12h debe convertir hora de 24h a 12h con AM/PM', () => {
      expect(window.formatTime12h('09:00')).toEqual({ time: '9:00', period: 'AM' });
      expect(window.formatTime12h('12:30')).toEqual({ time: '12:30', period: 'PM' });
      expect(window.formatTime12h('14:05')).toEqual({ time: '2:05', period: 'PM' });
      expect(window.formatTime12h('00:15')).toEqual({ time: '12:15', period: 'AM' });
    });

    it('Prueba 3: capitalize debe poner en mayúscula solo la primera letra', () => {
      expect(window.capitalize('presencial')).toBe('Presencial');
      expect(window.capitalize('VIRTUAL')).toBe('VIRTUAL');
      expect(window.capitalize('a')).toBe('A');
    });
  });

  // ============================================
  // 🧑‍💻 INTEGRANTE 2: VALIDACIÓN DE DATOS DEL PACIENTE
  // ============================================
  describe('Integrante 2: Validación de formulario', () => {
    it('Prueba 4: isFormValid debe retornar false si los campos obligatorios están vacíos', () => {
      window.BookingState.guestData.fullName = '';
      window.BookingState.guestData.email = '';
      expect(window.isFormValid()).toBe(false);
    });

    it('Prueba 5: isFormValid debe retornar false si el nombre tiene menos de 3 caracteres', () => {
      window.BookingState.guestData.fullName = 'Ab';
      window.BookingState.guestData.email = 'test@example.com';
      expect(window.isFormValid()).toBe(false);

      window.BookingState.guestData.fullName = 'Ana';
      expect(window.isFormValid()).toBe(true);
    });

    it('Prueba 6: isFormValid debe validar correctamente el formato de correo electrónico', () => {
      window.BookingState.guestData.fullName = 'Juan Pérez';

      const invalidEmails = ['juan', 'juan@', 'juan@dominio', 'juan.com', '@dominio.com'];
      invalidEmails.forEach(email => {
        window.BookingState.guestData.email = email;
        expect(window.isFormValid()).toBe(false);
      });

      window.BookingState.guestData.email = 'juan@dominio.com';
      expect(window.isFormValid()).toBe(true);
    });
  });

  // ============================================
  // 🧑‍💻 INTEGRANTE 3: REGLAS DE NEGOCIO DE LA AGENDA
  // ============================================
  describe('Integrante 3: Reglas de agenda y bloqueo de fechas', () => {
    it('Prueba 7: isDateBlocked debe retornar true para domingos o fechas feriadas', () => {
      const sunday = new Date(2026, 3, 12); // 12 de abril de 2026 (Domingo)
      expect(window.isDateBlocked(sunday)).toBe(true);

      const monday = new Date(2026, 3, 13); // 13 de abril de 2026 (Lunes)
      expect(window.isDateBlocked(monday)).toBe(false);

      const holiday = new Date(2026, 4, 1); // 1 de mayo de 2026 (Feriado configurado)
      expect(window.isDateBlocked(holiday)).toBe(true);
    });

    it('Prueba 8: generateTimeSlots debe generar turnos únicamente en el rango laboral (8h a 18h)', () => {
      const mockNow = new Date('2026-04-14T06:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      window.BookingState.selectedDate = '2026-04-14';
      window.BookingState.selectedEventType = window.BOOKING_EVENT_TYPES[0]; // Consulta General (30 min)

      const slots = window.generateTimeSlots();
      expect(slots.length).toBeGreaterThan(0);

      slots.forEach(slot => {
        const [hour] = slot.time.split(':').map(Number);
        expect(hour).toBeGreaterThanOrEqual(window.BOOKING_CONFIG.workStart);
        expect(hour).toBeLessThan(window.BOOKING_CONFIG.workEnd);
      });

      vi.useRealTimers();
    });

    it('Prueba 9: generateTimeSlots no debe ofrecer turnos con menos de 2 horas de antelación', () => {
      const mockNow = new Date('2026-04-14T10:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      window.BookingState.selectedDate = '2026-04-14';
      window.BookingState.selectedEventType = window.BOOKING_EVENT_TYPES[0]; // 30 min

      const slots = window.generateTimeSlots();

      slots.forEach(slot => {
        const [hour, min] = slot.time.split(':').map(Number);
        const slotHourDecimal = hour + min / 60;
        // Si son las 10:00 AM, el primer turno debe ser posterior o igual a las 12:00 PM
        expect(slotHourDecimal).toBeGreaterThanOrEqual(12);
      });

      vi.useRealTimers();
    });
  });

  // ============================================
  // 🧑‍💻 INTEGRANTE 4: SUGERENCIAS Y SOLAPAMIENTOS
  // ============================================
  describe('Integrante 4: Turnos alternativos y solapamientos', () => {
    it('Prueba 10: generateTimeSlots debe excluir horarios ocupados y evitar solapamientos', () => {
      window.BookingState.selectedDate = '2026-04-14';
      window.BookingState.selectedEventType = window.BOOKING_EVENT_TYPES[0]; // 30 min

      const mockNow = new Date('2026-04-14T06:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const slots = window.generateTimeSlots();
      const slot0900 = slots.find(s => s.time === '09:00');
      const slot1030 = slots.find(s => s.time === '10:30');

      // '09:00' está ocupado en MOCK_BOOKED_SLOTS
      expect(slot0900.available).toBe(false);
      // '10:30' está libre en MOCK_BOOKED_SLOTS para esa fecha
      expect(slot1030.available).toBe(true);

      vi.useRealTimers();
    });

    it('Prueba 11: findNearestSuggestions debe sugerir turnos en días cercanos si no hay disponibilidad en la fecha elegida', () => {
      window.BookingState.selectedDate = '2026-04-17'; // Lleno en la mayoría de turnos
      window.BookingState.selectedEventType = window.BOOKING_EVENT_TYPES[0];

      // Completamos el día agregando los huecos libres ('12:30' y '17:45') en el objeto mock de reservas
      if (window.MOCK_BOOKED_SLOTS && window.MOCK_BOOKED_SLOTS['2026-04-17']) {
        if (!window.MOCK_BOOKED_SLOTS['2026-04-17'].includes('12:30')) {
          window.MOCK_BOOKED_SLOTS['2026-04-17'].push('12:30');
        }
        if (!window.MOCK_BOOKED_SLOTS['2026-04-17'].includes('17:45')) {
          window.MOCK_BOOKED_SLOTS['2026-04-17'].push('17:45');
        }
      }

      const mockNow = new Date('2026-04-14T06:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const suggestions = window.findNearestSuggestions(3);
      expect(suggestions.length).toBeGreaterThan(0);

      suggestions.forEach(suggestion => {
        // La fecha sugerida debe ser distinta a la seleccionada (llena)
        expect(suggestion.date).not.toBe('2026-04-17');
      });

      vi.useRealTimers();
    });

    it('Prueba 12: findNearestSuggestions debe limitar las sugerencias al parámetro count especificado', () => {
      const mockNow = new Date('2026-04-14T06:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      window.BookingState.selectedDate = '2026-04-17';
      window.BookingState.selectedEventType = window.BOOKING_EVENT_TYPES[0];

      const suggestionsCount2 = window.findNearestSuggestions(2);
      expect(suggestionsCount2.length).toBe(2);

      const suggestionsCount3 = window.findNearestSuggestions(3);
      expect(suggestionsCount3.length).toBe(3);

      vi.useRealTimers();
    });
  });
});
