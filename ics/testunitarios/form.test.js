// ARCHIVO: ics/testunitarios/form.test.js
// MODULO: Tipos de Eventos (M03)
// COMPORTAMIENTO: Validación de campos y confirmación auto vs manual
// =====================================================================

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------
// 1. FUNCIONES A TESTEAR (Lógica pura de validación y confirmación)
// ---------------------------------------------------------------------

const DESCRIPTION_MAX_LENGTH = 500;

/**
 * Valida los datos requeridos para un tipo de evento.
 */
function validarTipoEvento({
  name,
  description = '',
  duration,
  modality,
  existingEvents = [],
  editingId = null,
}) {
  const errors = {};
  const trimmedName = name ? name.trim() : '';

  // Validación de nombre
  if (!trimmedName) {
    errors.name = 'El nombre es obligatorio';
  } else {
    const duplicate = existingEvents.find(
      (e) => e.name.toLowerCase() === trimmedName.toLowerCase() && e.id !== editingId
    );
    if (duplicate) {
      errors.name = 'Ya existe un tipo de evento con este nombre';
    }
  }

  // Validación de descripción
  if (description && description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres`;
  }

  // Validación de duración
  if (!duration || duration <= 0) {
    errors.duration = 'Debes seleccionar una duración';
  }

  // Validación de modalidad
  if (!modality) {
    errors.modality = 'Debes seleccionar una modalidad';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Gestiona el valor, etiqueta e interruptor de confirmación automática vs. manual.
 */
function gestionarConfirmacion(tipoSeleccionado = 'auto') {
  const esManual = tipoSeleccionado === 'manual';
  return {
    confirmation: esManual ? 'manual' : 'auto',
    label: esManual ? 'Confirmación Manual' : 'Confirmación Automática',
    isChecked: esManual,
  };
}

/**
 * Evalúa el estado del contador de caracteres de la descripción.
 */
function evaluarEstadoContador(longitud, maxLimite = DESCRIPTION_MAX_LENGTH) {
  if (longitud >= maxLimite) return 'limit';
  if (longitud >= maxLimite * 0.9) return 'warning';
  return 'normal';
}

// ---------------------------------------------------------------------
// 2. SUITE DE TESTS UNITARIOS (15 TESTS)
// ---------------------------------------------------------------------

describe('Módulo 2: Validación de tipos de evento y lógica de confirmación', () => {

  // ====================================================
  // CASOS NORMALES (Tests 16 a 20)
  // ====================================================
  describe('Casos Normales', () => {
    it('Prueba 16: retorna isValid: true para un tipo de evento con todos los campos válidos', () => {
      // Arrange
      const evento = {
        name: 'Consulta Cardiológica',
        description: 'Chequeo preventivo de rutina.',
        duration: 30,
        modality: 'presencial',
        existingEvents: [],
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(true);
      expect(resultado.errors).toEqual({});
    });

    it('Prueba 17: inicializa la confirmación por defecto en "auto" con toggle apagado', () => {
      // Arrange & Act
      const estado = gestionarConfirmacion();

      // Assert
      expect(estado.confirmation).toBe('auto');
      expect(estado.label).toBe('Confirmación Automática');
      expect(estado.isChecked).toBe(false);
    });

    it('Prueba 18: conmuta correctamente a confirmación "manual" con etiqueta y toggle activo', () => {
      // Arrange & Act
      const estado = gestionarConfirmacion('manual');

      // Assert
      expect(estado.confirmation).toBe('manual');
      expect(estado.label).toBe('Confirmación Manual');
      expect(estado.isChecked).toBe(true);
    });

    it('Prueba 19: persiste la propiedad confirmation: "manual" en el objeto generado', () => {
      // Arrange
      const entrada = {
        name: 'Cirugía Compleja',
        duration: 60,
        modality: 'presencial',
      };
      const configuracion = gestionarConfirmacion('manual');

      // Act
      const eventoCreado = {
        ...entrada,
        confirmation: configuracion.confirmation,
      };

      // Assert
      expect(eventoCreado.confirmation).toBe('manual');
    });

    it('Prueba 20: carga fielmente la confirmación "manual" de un evento preexistente al abrir edición', () => {
      // Arrange: Evento previamente guardado con confirmación manual
      const eventoExistente = {
        id: 'evt-003',
        name: 'Cirugía Programada',
        confirmation: 'manual',
      };

      // Act
      const estadoFormulario = gestionarConfirmacion(eventoExistente.confirmation);

      // Assert
      expect(estadoFormulario.confirmation).toBe('manual');
      expect(estadoFormulario.isChecked).toBe(true);
    });
  });

  // ====================================================
  // CASOS LÍMITE O BORDE (Tests 21 a 25)
  // ====================================================
  describe('Casos Límite o Borde', () => {
    it('Prueba 21: aplica trimming y acepta un nombre con espacios iniciales y finales', () => {
      // Arrange: Nombre con espacios que deben recortarse
      const evento = {
        name: '   Consulta Pediátrica   ',
        duration: 30,
        modality: 'virtual',
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(true);
      expect(resultado.errors.name).toBeUndefined();
    });

    it('Prueba 22: acepta una descripción en el límite exacto permitido (500 caracteres)', () => {
      // Arrange: Exactamente 500 caracteres
      const descripcion500 = 'A'.repeat(500);
      const evento = {
        name: 'Evaluación Nutricional',
        description: descripcion500,
        duration: 45,
        modality: 'presencial',
      };

      // Act
      const resultado = validarTipoEvento(evento);
      const estadoContador = evaluarEstadoContador(descripcion500.length);

      // Assert
      expect(resultado.isValid).toBe(true);
      expect(estadoContador).toBe('limit');
    });

    it('Prueba 23: permite guardar un evento con descripción vacía por ser un campo opcional', () => {
      // Arrange
      const evento = {
        name: 'Extracción de Sangre',
        description: '',
        duration: 15,
        modality: 'presencial',
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(true);
    });

    it('Prueba 24: activa el estado de advertencia "warning" al alcanzar el 90% de la descripción (450 caracteres)', () => {
      // Arrange: 450 caracteres
      const longitud = 450;

      // Act
      const estadoContador = evaluarEstadoContador(longitud);

      // Assert
      expect(estadoContador).toBe('warning');
    });

    it('Prueba 25: valida una duración personalizada mayor a los valores predeterminados (ej: 90 min)', () => {
      // Arrange: Duración customizada de 90 min
      const evento = {
        name: 'Sesión Terapéutica Extensa',
        duration: 90,
        modality: 'presencial',
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(true);
      expect(resultado.errors.duration).toBeUndefined();
    });
  });

  // ====================================================
  // CASOS INVÁLIDOS O DE ERROR (Tests 26 a 30)
  // ====================================================
  describe('Casos Inválidos o de Error', () => {
    it('Prueba 26: rechaza nombres vacíos o compuestos únicamente por espacios en blanco', () => {
      // Arrange
      const evento = {
        name: '     ',
        duration: 30,
        modality: 'presencial',
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.name).toBe('El nombre es obligatorio');
    });

    it('Prueba 27: rechaza nombres duplicados ignorando mayúsculas y minúsculas', () => {
      // Arrange: Ya existe "Consulta General"
      const existingEvents = [{ id: 'evt-001', name: 'Consulta General' }];
      const evento = {
        name: 'consulta general',
        duration: 30,
        modality: 'presencial',
        existingEvents,
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.name).toBe('Ya existe un tipo de evento con este nombre');
    });

    it('Prueba 28: permite conservar el mismo nombre si se está editando el propio evento (evita falso duplicado)', () => {
      // Arrange: El evento con id evt-001 mantiene su nombre propio "Consulta General"
      const existingEvents = [{ id: 'evt-001', name: 'Consulta General' }];
      const evento = {
        name: 'Consulta General',
        duration: 45,
        modality: 'presencial',
        existingEvents,
        editingId: 'evt-001',
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert: No debe marcar duplicado consigo mismo
      expect(resultado.isValid).toBe(true);
      expect(resultado.errors.name).toBeUndefined();
    });

    it('Prueba 29: rechaza descripciones que exceden el límite de 500 caracteres (ej: 501)', () => {
      // Arrange: 501 caracteres (desborde por 1 caracter)
      const descripcion501 = 'B'.repeat(501);
      const evento = {
        name: 'Consulta Especial',
        description: descripcion501,
        duration: 30,
        modality: 'presencial',
      };

      // Act
      const resultado = validarTipoEvento(evento);

      // Assert
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.description).toContain('La descripción no puede superar los 500 caracteres');
    });

    it('Prueba 30: rechaza tipos de evento sin duración o con duración menor o igual a cero', () => {
      // Arrange
      const eventoSinDuracion = {
        name: 'Control Rápido',
        duration: null,
        modality: 'presencial',
      };
      const eventoDuracionCero = {
        name: 'Control Rápido',
        duration: 0,
        modality: 'presencial',
      };

      // Act
      const resNull = validarTipoEvento(eventoSinDuracion);
      const resCero = validarTipoEvento(eventoDuracionCero);

      // Assert
      expect(resNull.isValid).toBe(false);
      expect(resNull.errors.duration).toBe('Debes seleccionar una duración');
      expect(resCero.isValid).toBe(false);
      expect(resCero.errors.duration).toBe('Debes seleccionar una duración');
    });
  });
});
