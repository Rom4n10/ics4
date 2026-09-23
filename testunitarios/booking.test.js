// =====================================================================
// ARCHIVO: testunitarios/booking.test.js
// MODULO: Agenda / Booking (M04)
// COMPORTAMIENTO: Verificación de que no se puede reservar en el pasado,
//                 cálculo del tiempo de antelación mínima
// =====================================================================

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------
// 1. FUNCIONES A TESTEAR (Lógica pura de fechas pasadas y antelación)
// ---------------------------------------------------------------------

const HORAS_ANTELACION_POR_DEFECTO = 2; // 2 horas de antelación mínima requerida

/**
 * Convierte una fecha y hora en objeto Date normalizado.
 * Soporta strings 'YYYY-MM-DD' y 'HH:MM' o instancias Date.
 */
function parsearFechaHora(fecha, hora = '00:00') {
  if (!fecha) return null;
  if (fecha instanceof Date) return isNaN(fecha.getTime()) ? null : fecha;

  const [y, m, d] = fecha.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  if ([y, m, d, h, min].some(isNaN)) return null;

  const fechaObj = new Date(y, m - 1, d, h, min, 0, 0);
  return isNaN(fechaObj.getTime()) ? null : fechaObj;
}

/**
 * Determina si una fecha y horario se encuentra en el pasado respecto a la hora del sistema.
 */
function esHorarioEnElPasado(fechaHora, now = new Date()) {
  const target = parsearFechaHora(fechaHora);
  const referencia = parsearFechaHora(now);
  if (!target || !referencia) return true;
  return target.getTime() <= referencia.getTime();
}

/**
 * Calcula la diferencia en horas decimales entre el momento actual y el turno deseado.
 * Retorna valores negativos si el turno es pasado.
 */
function calcularHorasAntelacion(fechaHora, now = new Date()) {
  const target = parsearFechaHora(fechaHora);
  const referencia = parsearFechaHora(now);
  if (!target || !referencia) return -Infinity;

  const diffMs = target.getTime() - referencia.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Verifica si un turno cumple con la regla de antelación mínima requerida.
 */
function cumpleAntelacionMinima(fechaHora, minAdvanceHours = HORAS_ANTELACION_POR_DEFECTO, now = new Date()) {
  const horasMinimas = Math.max(0, minAdvanceHours);
  const horasDiferencia = calcularHorasAntelacion(fechaHora, now);
  return horasDiferencia >= horasMinimas;
}

/**
 * Calcula el primer horario factible a partir de la hora actual y la antelación mínima,
 * redondeando hacia el siguiente intervalo de minutos configurado (ej: 15 min).
 */
function obtenerPrimerHorarioPermitido(now = new Date(), minAdvanceHours = HORAS_ANTELACION_POR_DEFECTO, interval = 15) {
  const base = parsearFechaHora(now);
  if (!base) return null;

  const msAntelacion = Math.max(0, minAdvanceHours) * 60 * 60 * 1000;
  const tiempoMinimo = new Date(base.getTime() + msAntelacion);

  const minutos = tiempoMinimo.getMinutes();
  const resto = minutos % interval;
  if (resto !== 0) {
    tiempoMinimo.setMinutes(minutos + (interval - resto), 0, 0);
  } else if (tiempoMinimo.getSeconds() > 0 || tiempoMinimo.getMilliseconds() > 0) {
    tiempoMinimo.setMinutes(minutos + interval, 0, 0);
  }

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(tiempoMinimo.getHours())}:${pad(tiempoMinimo.getMinutes())}`;
}

/**
 * Validador integral de viabilidad de una reserva por fecha y horario.
 */
function validarReservaHorario(fechaStr, horaStr, minAdvanceHours = HORAS_ANTELACION_POR_DEFECTO, now = new Date()) {
  const target = parsearFechaHora(fechaStr, horaStr);
  if (!target) {
    return { permitida: false, razon: 'formato_invalido', horasDiferencia: null };
  }

  const horasDiferencia = calcularHorasAntelacion(target, now);

  if (esHorarioEnElPasado(target, now)) {
    return { permitida: false, razon: 'horario_pasado', horasDiferencia };
  }

  if (horasDiferencia < Math.max(0, minAdvanceHours)) {
    return { permitida: false, razon: 'antelacion_insuficiente', horasDiferencia };
  }

  return { permitida: true, razon: null, horasDiferencia };
}

// ---------------------------------------------------------------------
// 2. SUITE DE TESTS UNITARIOS (15 TESTS)
// ---------------------------------------------------------------------

describe('Módulo 1: Control de fechas pasadas y tiempo de antelación mínima', () => {

  // ====================================================
  // CASOS NORMALES (Tests 1 a 5)
  // ====================================================
  describe('Casos Normales', () => {
    it('Prueba 1: permite un turno en fecha futura con antelación ampliamente superior a 2 horas', () => {
      // Arrange
      const now = new Date('2026-06-15T09:00:00');
      const fechaTurno = '2026-06-16'; // Día siguiente
      const horaTurno = '10:00';

      // Act
      const resultado = validarReservaHorario(fechaTurno, horaTurno, 2, now);

      // Assert
      expect(resultado.permitida).toBe(true);
      expect(resultado.horasDiferencia).toBeGreaterThan(24);
    });

    it('Prueba 2: detecta correctamente que una fecha de días anteriores pertenece al pasado', () => {
      // Arrange
      const now = new Date('2026-06-15T12:00:00');
      const fechaAyer = new Date('2026-06-14T12:00:00');

      // Act
      const esPasada = esHorarioEnElPasado(fechaAyer, now);

      // Assert
      expect(esPasada).toBe(true);
    });

    it('Prueba 3: calcula de forma exacta las horas de antelación entre la hora actual y el turno futuro', () => {
      // Arrange: De 10:00 a 15:30 hay exactamente 5.5 horas de antelación
      const now = new Date('2026-06-15T10:00:00');
      const turno = new Date('2026-06-15T15:30:00');

      // Act
      const horasAntelacion = calcularHorasAntelacion(turno, now);

      // Assert
      expect(horasAntelacion).toBe(5.5);
    });

    it('Prueba 4: acepta un turno en el mismo día cuando la antelación supera las 2 horas requeridas', () => {
      // Arrange: Hora actual 08:00, turno a las 11:30 (3.5 horas de margen)
      const now = new Date('2026-06-15T08:00:00');

      // Act
      const esValido = cumpleAntelacionMinima(new Date('2026-06-15T11:30:00'), 2, now);

      // Assert
      expect(esValido).toBe(true);
    });

    it('Prueba 5: calcula el primer horario permitido redondeando al intervalo de 15 minutos', () => {
      // Arrange: Son las 09:05. Con 2 horas de antelación mínima (11:05), el primer slot de 15 min es 11:15
      const now = new Date('2026-06-15T09:05:00');

      // Act
      const primerSlot = obtenerPrimerHorarioPermitido(now, 2, 15);

      // Assert
      expect(primerSlot).toBe('11:15');
    });
  });

  // ====================================================
  // CASOS LÍMITE O BORDE (Tests 6 a 10)
  // ====================================================
  describe('Casos Límite o Borde', () => {
    it('Prueba 6: acepta una reserva en el umbral exacto de 2.0 horas de antelación', () => {
      // Arrange: Hora actual 10:00:00, turno exactamente a las 12:00:00
      const now = new Date('2026-06-15T10:00:00');
      const turnoExacto = new Date('2026-06-15T12:00:00');

      // Act
      const resultado = cumpleAntelacionMinima(turnoExacto, 2, now);
      const horas = calcularHorasAntelacion(turnoExacto, now);

      // Assert: Exactamente 2 horas, debe ser permitido
      expect(horas).toBe(2);
      expect(resultado).toBe(true);
    });

    it('Prueba 7: rechaza una reserva con apenas 1 minuto menos del margen mínimo requerido (1h 59min)', () => {
      // Arrange: Hora actual 10:00:00, turno a las 11:59:00 (1 hora y 59 minutos)
      const now = new Date('2026-06-15T10:00:00');
      const turnoLimiteInferior = new Date('2026-06-15T11:59:00');

      // Act
      const resultado = cumpleAntelacionMinima(turnoLimiteInferior, 2, now);

      // Assert: Falta 1 minuto para las 2 horas completas, debe rechazarse
      expect(resultado).toBe(false);
    });

    it('Prueba 8: calcula la antelación correctamente cruzando el cambio de día a medianoche', () => {
      // Arrange: Son las 23:00 del 15 de junio y el turno es a la 01:30 del 16 de junio (2.5 horas)
      const now = new Date('2026-06-15T23:00:00');
      const turnoMedianoche = new Date('2026-06-16T01:30:00');

      // Act
      const horas = calcularHorasAntelacion(turnoMedianoche, now);
      const cumple = cumpleAntelacionMinima(turnoMedianoche, 2, now);

      // Assert
      expect(horas).toBe(2.5);
      expect(cumple).toBe(true);
    });

    it('Prueba 9: permite reservas inmediatas cuando la antelación mínima está configurada en 0 horas', () => {
      // Arrange: Con antelación 0h, un turno a 10 minutos en el futuro debe ser permitido
      const now = new Date('2026-06-15T10:00:00');
      const turnoInmediato = new Date('2026-06-15T10:10:00');

      // Act
      const resultado = cumpleAntelacionMinima(turnoInmediato, 0, now);

      // Assert
      expect(resultado).toBe(true);
    });

    it('Prueba 10: considera como horario pasado si el turno coincide exactamente con el instante actual (now)', () => {
      // Arrange: Turno fijado en el mismo segundo y milisegundo que now
      const now = new Date('2026-06-15T10:00:00.000');
      const mismoInstante = new Date('2026-06-15T10:00:00.000');

      // Act
      const esPasado = esHorarioEnElPasado(mismoInstante, now);

      // Assert: No se puede reservar en el presente inmediato o pasado
      expect(esPasado).toBe(true);
    });
  });

  // ====================================================
  // CASOS INVÁLIDOS O DE ERROR (Tests 11 a 15)
  // ====================================================
  describe('Casos Inválidos o de Error', () => {
    it('Prueba 11: rechaza un turno en el mismo día pero en una hora que ya ha transcurrido', () => {
      // Arrange: Son las 16:00 y se intenta reservar a las 11:00 del mismo día
      const now = new Date('2026-06-15T16:00:00');

      // Act
      const resultado = validarReservaHorario('2026-06-15', '11:00', 2, now);

      // Assert
      expect(resultado.permitida).toBe(false);
      expect(resultado.razon).toBe('horario_pasado');
      expect(resultado.horasDiferencia).toBeLessThan(0);
    });

    it('Prueba 12: rechaza un turno con fecha de un mes o año anterior', () => {
      // Arrange: Fecha en el año 2025 respecto al año actual 2026
      const now = new Date('2026-06-15T10:00:00');

      // Act
      const resultado = validarReservaHorario('2025-12-01', '10:00', 2, now);

      // Assert
      expect(resultado.permitida).toBe(false);
      expect(resultado.razon).toBe('horario_pasado');
    });

    it('Prueba 13: rechaza un turno futuro pero con antelación insuficiente (ej: solo 30 minutos)', () => {
      // Arrange: Son las 14:00 y el turno es a las 14:30 (diferencia 0.5 horas < 2 horas)
      const now = new Date('2026-06-15T14:00:00');

      // Act
      const resultado = validarReservaHorario('2026-06-15', '14:30', 2, now);

      // Assert
      expect(resultado.permitida).toBe(false);
      expect(resultado.razon).toBe('antelacion_insuficiente');
      expect(resultado.horasDiferencia).toBe(0.5);
    });

    it('Prueba 14: retorna error controlado de formato inválido si la fecha o la hora son nulas o erróneas', () => {
      // Arrange & Act
      const resNull = validarReservaHorario(null, '10:00');
      const resInvalida = validarReservaHorario('fecha-no-valida', 'xx:yy');

      // Assert: Manejo seguro sin excepciones
      expect(resNull.permitida).toBe(false);
      expect(resNull.razon).toBe('formato_invalido');
      expect(resInvalida.permitida).toBe(false);
      expect(resInvalida.razon).toBe('formato_invalido');
    });

    it('Prueba 15: normaliza configuraciones de antelación mínima negativas para evitar reservas pasadas', () => {
      // Arrange: Antelación configurada con valor negativo (-2 horas)
      const now = new Date('2026-06-15T10:00:00');
      const turnoPasado = new Date('2026-06-15T09:00:00');

      // Act: Intentar validar un turno que ocurrió hace 1 hora con antelación -2
      const resultado = validarReservaHorario('2026-06-15', '09:00', -2, now);

      // Assert: Nunca debe permitirse una fecha que ya ocurrió
      expect(resultado.permitida).toBe(false);
      expect(resultado.razon).toBe('horario_pasado');
    });
  });
});
