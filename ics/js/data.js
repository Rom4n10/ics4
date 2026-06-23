/* ============================================
   Mock Data - Tipos de Eventos
   ============================================ */

const EVENT_TYPES_DATA = [
  {
    id: 'evt-001',
    name: 'Consulta General',
    description: 'Consulta médica general para evaluación de síntomas, revisión de historial clínico y seguimiento de tratamientos.',
    duration: 30,
    modality: 'presencial',
    confirmation: 'auto',
    status: 'active',
    createdAt: '2026-01-15T10:30:00',
    updatedAt: '2026-03-20T14:00:00',
    mediaFiles: []
  },
  {
    id: 'evt-002',
    name: 'Teleconsulta',
    description: 'Consulta médica virtual a través de videollamada para seguimiento de pacientes remotos.',
    duration: 15,
    modality: 'virtual',
    confirmation: 'auto',
    status: 'active',
    createdAt: '2026-02-01T09:00:00',
    updatedAt: '2026-03-18T11:30:00',
    mediaFiles: []
  },
  {
    id: 'evt-003',
    name: 'Cirugía Programada',
    description: 'Intervención quirúrgica programada que requiere preparación previa y confirmación del equipo médico.',
    duration: 60,
    modality: 'presencial',
    confirmation: 'manual',
    status: 'active',
    createdAt: '2026-01-20T08:00:00',
    updatedAt: '2026-04-01T16:45:00',
    mediaFiles: []
  },
  {
    id: 'evt-004',
    name: 'Control Post-quirúrgico',
    description: 'Seguimiento médico posterior a una intervención para evaluar la evolución del paciente.',
    duration: 30,
    modality: 'ambas',
    confirmation: 'auto',
    status: 'active',
    createdAt: '2026-02-10T12:00:00',
    updatedAt: '2026-03-25T10:15:00',
    mediaFiles: []
  },
  {
    id: 'evt-005',
    name: 'Evaluación Psicológica',
    description: 'Sesión de evaluación psicológica para diagnóstico o seguimiento de salud mental del paciente.',
    duration: 45,
    modality: 'virtual',
    confirmation: 'manual',
    status: 'active',
    createdAt: '2026-02-15T14:30:00',
    updatedAt: '2026-04-05T09:00:00',
    mediaFiles: []
  },
  {
    id: 'evt-006',
    name: 'Terapia Física',
    description: 'Sesión de rehabilitación física con ejercicios supervisados y seguimiento de progreso.',
    duration: 45,
    modality: 'presencial',
    confirmation: 'auto',
    status: 'active',
    createdAt: '2026-03-01T11:00:00',
    updatedAt: '2026-04-08T15:30:00',
    mediaFiles: []
  },
  {
    id: 'evt-007',
    name: 'Consulta de Emergencia',
    description: 'Atención médica de urgencia para casos que requieren evaluación inmediata.',
    duration: 15,
    modality: 'presencial',
    confirmation: 'manual',
    status: 'active',
    createdAt: '2026-03-05T07:00:00',
    updatedAt: '2026-04-10T12:00:00',
    mediaFiles: []
  },
  {
    id: 'evt-008',
    name: 'Revisión de Estudios',
    description: 'Consulta para análisis y revisión de resultados de estudios de laboratorio o imágenes.',
    duration: 30,
    modality: 'virtual',
    confirmation: 'auto',
    status: 'inactive',
    createdAt: '2026-01-10T13:00:00',
    updatedAt: '2026-02-28T17:00:00',
    mediaFiles: []
  },
  {
    id: 'evt-009',
    name: 'Vacunación',
    description: 'Aplicación de vacunas según calendario de vacunación o solicitud individual del paciente.',
    duration: 15,
    modality: 'presencial',
    confirmation: 'auto',
    status: 'active',
    createdAt: '2026-03-10T08:30:00',
    updatedAt: '2026-04-12T10:00:00',
    mediaFiles: []
  },
  {
    id: 'evt-010',
    name: 'Consulta Nutricional',
    description: 'Evaluación y planificación nutricional personalizada con indicaciones alimentarias.',
    duration: 45,
    modality: 'ambas',
    confirmation: 'auto',
    status: 'inactive',
    createdAt: '2026-02-20T10:00:00',
    updatedAt: '2026-03-15T14:30:00',
    mediaFiles: []
  }
];

/** Duration presets */
const DURATION_PRESETS = [15, 30, 45, 60];

/** Modality options */
const MODALITY_OPTIONS = [
  { value: 'presencial', label: 'Presencial', icon: 'building' },
  { value: 'virtual', label: 'Virtual', icon: 'video' },
  { value: 'ambas', label: 'Ambas', icon: 'globe' }
];

/** Confirmation types */
const CONFIRMATION_TYPES = [
  { value: 'auto', label: 'Automática' },
  { value: 'manual', label: 'Manual' }
];

/** Status options */
const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' }
];

/** Duration filter options */
const DURATION_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
  { value: 'custom', label: 'Personalizada' }
];

/** Tutorial steps */
const TUTORIAL_STEPS = [
  {
    target: '#btn-new-event',
    title: 'Crear Tipo de Evento',
    description: 'Haz clic aquí para crear un nuevo tipo de evento. Deberás completar el nombre, la duración y la modalidad como campos obligatorios.',
    position: 'bottom'
  },
  {
    target: '#filters-panel',
    title: 'Filtrar tus Eventos',
    description: 'Usa los filtros para buscar tipos de evento por nombre, estado, duración o fecha de creación. Los filtros se aplican en tiempo real.',
    position: 'bottom'
  },
  {
    target: '#view-toggle',
    title: 'Cambiar la Vista',
    description: 'Alterna entre la vista de tabla y la vista de tarjetas según tu preferencia.',
    position: 'bottom'
  },
  {
    target: '#btn-theme',
    title: 'Personalizar Interfaz',
    description: 'Personaliza el tema, los colores y la densidad visual de la interfaz a tu gusto.',
    position: 'left'
  }
];

/** Theme accent colors */
const ACCENT_COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#6366f1', label: 'Índigo' }
];
