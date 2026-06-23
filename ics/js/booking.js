/* ============================================
   M04 - Booking Flow Logic
   ============================================ */

/** ==========================================
 *  CONSTANTS & CONFIGURATION
 *  ========================================== */
const BOOKING_CONFIG = {
  sessionTimeoutMs: 5 * 60 * 1000,       // 5 minutos (M04-R01NF)
  pollingIntervalMs: 30 * 1000,           // 30 segundos (M04-R09F)
  idleTimeoutMs: 60 * 1000,              // 60 seg sin interacción (M04-R09F)
  warningThresholdMs: 2 * 60 * 1000,     // 2 min restantes → advertencia
  criticalThresholdMs: 60 * 1000,        // 1 min restante → crítico
  minAdvanceHours: 2,                     // Antelación mínima de reserva
  maxBookingsPerDay: 20,                  // Límite por día
  slotIntervalMinutes: 15,               // Intervalo entre turnos
  workStart: 8,                           // Hora inicio laboral
  workEnd: 18,                            // Hora fin laboral
  blockedDays: [0],                       // Domingo bloqueado (0=Dom)
  blockedDates: ['2026-04-20', '2026-05-01', '2026-05-25'],
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** ==========================================
 *  EVENT TYPES (From M03)
 *  ========================================== */
const BOOKING_EVENT_TYPES = [
  {
    id: 'evt-001', name: 'Consulta General',
    description: 'Evaluación de síntomas y seguimiento.',
    duration: 30, modality: 'presencial', icon: '🏥'
  },
  {
    id: 'evt-002', name: 'Teleconsulta',
    description: 'Consulta virtual por videollamada.',
    duration: 15, modality: 'virtual', icon: '💻'
  },
  {
    id: 'evt-003', name: 'Cirugía Programada',
    description: 'Intervención quirúrgica programada.',
    duration: 60, modality: 'presencial', icon: '⚕️'
  },
  {
    id: 'evt-004', name: 'Control Post-quirúrgico',
    description: 'Seguimiento posterior a cirugía.',
    duration: 30, modality: 'ambas', icon: '📋'
  },
  {
    id: 'evt-005', name: 'Evaluación Psicológica',
    description: 'Sesión de salud mental.',
    duration: 45, modality: 'virtual', icon: '🧠'
  },
  {
    id: 'evt-006', name: 'Terapia Física',
    description: 'Rehabilitación y ejercicios supervisados.',
    duration: 45, modality: 'presencial', icon: '🦿'
  },
  {
    id: 'evt-009', name: 'Vacunación',
    description: 'Aplicación de vacunas.',
    duration: 15, modality: 'presencial', icon: '💉'
  }
];

/** ==========================================
 *  MOCK BOOKED SLOTS (Simulate occupied)
 *  ========================================== */
const MOCK_BOOKED_SLOTS = {
  '2026-04-14': ['09:00', '09:30', '10:00', '14:00', '14:30'],
  '2026-04-15': ['08:00', '08:30', '11:00', '11:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
  '2026-04-16': ['09:00', '10:30', '13:00'],
  '2026-04-17': ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
  '2026-04-21': ['08:00', '09:00', '10:00'],
};

/** ==========================================
 *  APPLICATION STATE
 *  ========================================== */
const BookingState = {
  currentStep: 1,
  selectedEventType: null,
  selectedDate: null,
  selectedSlot: null,
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  guestData: { fullName: '', email: '', phone: '', note: '' },
  timerActive: false,
  timerStartTime: null,
  timerInterval: null,
  pollingInterval: null,
  pollingActive: false,
  idleTimeout: null,
  lastInteractionTime: Date.now(),
  isExpired: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

/** ==========================================
 *  DOM REFERENCES
 *  ========================================== */
function getEl(id) {
  return document.getElementById(id);
}

/** ==========================================
 *  INITIALIZATION
 *  ========================================== */
function initBooking() {
  renderTimezone();
  renderStepper();
  renderStep1();
  setupIdleDetection();
  setupFormValidation();
}

/** ==========================================
 *  TIMEZONE DETECTION (M04-R03F tz)
 *  ========================================== */
function renderTimezone() {
  const badge = getEl('timezone-badge');
  if (badge) {
    const tz = BookingState.timezone.replace(/_/g, ' ');
    const offset = new Date().getTimezoneOffset();
    const sign = offset <= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const mins = String(Math.abs(offset) % 60).padStart(2, '0');
    badge.querySelector('.tz-name').textContent = `${tz} (UTC${sign}${hours}:${mins})`;
  }
}

/** ==========================================
 *  STEPPER
 *  ========================================== */
function renderStepper() {
  const steps = ['Evento', 'Horario', 'Datos', 'Confirmar'];
  const container = getEl('booking-stepper');
  if (!container) return;

  container.innerHTML = steps.map((label, i) => {
    const stepNum = i + 1;
    const isActive = stepNum === BookingState.currentStep;
    const isCompleted = stepNum < BookingState.currentStep;
    const wrapperClass = isActive ? 'active' : (isCompleted ? 'completed' : '');
    const dotClass = isActive ? 'active' : (isCompleted ? 'completed' : '');
    const dotContent = isCompleted
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
      : stepNum;
    const lineHtml = i < steps.length - 1
      ? `<div class="stepper-line ${isCompleted ? 'completed' : ''}"></div>`
      : '';

    return `
      <div class="stepper-item">
        <div class="stepper-dot-wrapper ${wrapperClass}">
          <div class="stepper-dot ${dotClass}">${dotContent}</div>
          <span class="stepper-label">${label}</span>
        </div>
        ${lineHtml}
      </div>
    `;
  }).join('');
}

function goToStep(step) {
  if (step < 1 || step > 4) return;

  // Hide current step
  document.querySelectorAll('.booking-step').forEach(el => el.classList.remove('active'));

  BookingState.currentStep = step;

  // Show new step
  const stepEl = getEl(`step-${step}`);
  if (stepEl) {
    stepEl.classList.remove('active');
    // Force reflow for animation
    void stepEl.offsetHeight;
    stepEl.classList.add('active');
  }

  renderStepper();
  updateFooterButtons();

  // Start timer on step 2 (M04-R04F, R05F)
  if (step === 2 && !BookingState.timerActive && BookingState.selectedSlot === null) {
    // Don't start timer yet, wait for slot selection
  }

  if (step === 2) {
    renderStep2();
    startPolling();
  }

  if (step === 3) {
    renderStep3Focus();
  }

  if (step === 4) {
    renderStep4();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** ==========================================
 *  STEP 1: Event Type + Day
 *  ========================================== */
function renderStep1() {
  renderEventTypes();
  renderCalendar();
}

function renderEventTypes() {
  const container = getEl('event-types-list');
  if (!container) return;

  container.innerHTML = BOOKING_EVENT_TYPES.map(evt => {
    const isSelected = BookingState.selectedEventType?.id === evt.id;
    return `
      <button class="event-type-card ${isSelected ? 'selected' : ''}"
              data-event-id="${evt.id}"
              onclick="selectEventType('${evt.id}')"
              aria-label="Seleccionar ${evt.name}">
        <div class="event-type-icon ${evt.modality}">${evt.icon}</div>
        <div class="event-type-info">
          <div class="event-type-name">${evt.name}</div>
          <div class="event-type-meta">
            <span>${evt.duration} min</span>
            <span class="dot"></span>
            <span>${capitalize(evt.modality)}</span>
          </div>
        </div>
        <div class="event-type-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>
    `;
  }).join('');
}

function selectEventType(eventId) {
  BookingState.selectedEventType = BOOKING_EVENT_TYPES.find(e => e.id === eventId);
  renderEventTypes();
  updateFooterButtons();
  showToast('info', `Seleccionado: ${BookingState.selectedEventType.name}`);
}

/** ==========================================
 *  CALENDAR
 *  ========================================== */
function renderCalendar() {
  const { calendarMonth, calendarYear } = BookingState;
  const container = getEl('calendar-widget');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  // Month label
  getEl('calendar-month-label').textContent = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;

  // Disable prev button if current month
  const prevBtn = getEl('calendar-prev');
  if (prevBtn) {
    prevBtn.disabled = (calendarYear === today.getFullYear() && calendarMonth <= today.getMonth());
  }

  // Generate days
  const daysContainer = getEl('calendar-days');
  let html = '';

  // Empty cells for offset
  for (let i = 0; i < startDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(calendarYear, calendarMonth, day);
    const dateStr = formatDateKey(date);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isBlocked = isDateBlocked(date);
    const isSelected = BookingState.selectedDate === dateStr;
    const hasSlots = !isPast && !isBlocked;

    let classes = 'calendar-day';
    if (isPast || isBlocked) classes += ' disabled';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (isBlocked) classes += ' blocked';

    const dotHtml = hasSlots
      ? '<span class="availability-dot"></span>'
      : (isBlocked && !isPast ? '<span class="availability-dot" style="background:var(--color-danger-400)"></span>' : '');

    html += `
      <button class="${classes}" ${isPast || isBlocked ? 'disabled' : ''}
              onclick="selectDate('${dateStr}')"
              aria-label="${day} de ${MONTH_NAMES[calendarMonth]}">
        ${day}
        ${dotHtml}
      </button>
    `;
  }

  daysContainer.innerHTML = html;
}

function selectDate(dateStr) {
  BookingState.selectedDate = dateStr;
  renderCalendar();
  updateFooterButtons();

  const parts = dateStr.split('-');
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayName = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[dateObj.getMonth()];
  showToast('info', `Día seleccionado: ${dayName} ${parts[2]} de ${monthName}`);
}

function navigateCalendar(direction) {
  BookingState.calendarMonth += direction;
  if (BookingState.calendarMonth > 11) {
    BookingState.calendarMonth = 0;
    BookingState.calendarYear++;
  } else if (BookingState.calendarMonth < 0) {
    BookingState.calendarMonth = 11;
    BookingState.calendarYear--;
  }
  renderCalendar();
}

function isDateBlocked(date) {
  const dayOfWeek = date.getDay();
  if (BOOKING_CONFIG.blockedDays.includes(dayOfWeek)) return true;
  const dateStr = formatDateKey(date);
  return BOOKING_CONFIG.blockedDates.includes(dateStr);
}

/** ==========================================
 *  STEP 2: Time Slot Selection
 *  ========================================== */
function renderStep2() {
  const container = getEl('time-slots-container');
  if (!container) return;

  // Update date display
  const dateDisplay = getEl('selected-date-display');
  if (dateDisplay && BookingState.selectedDate) {
    const parts = BookingState.selectedDate.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayName = DAY_NAMES[dateObj.getDay()];
    const monthName = MONTH_NAMES[dateObj.getMonth()];
    dateDisplay.innerHTML = `<strong>${dayName} ${parts[2]} de ${monthName} ${parts[0]}</strong>`;
  }

  // Update event type display
  const evtDisplay = getEl('selected-event-display');
  if (evtDisplay && BookingState.selectedEventType) {
    evtDisplay.textContent = `${BookingState.selectedEventType.name} · ${BookingState.selectedEventType.duration} min`;
  }

  // Show loading first
  container.innerHTML = `
    <div class="slots-loading">
      <div class="slots-loading-spinner"></div>
      <span class="slots-loading-text">Buscando horarios disponibles...</span>
    </div>
  `;

  // Simulate loading delay
  setTimeout(() => {
    const slots = generateTimeSlots();
    if (slots.length === 0) {
      renderNoSlots(container);
    } else {
      renderTimeSlots(container, slots);
    }
  }, 600);
}

function generateTimeSlots() {
  if (!BookingState.selectedDate || !BookingState.selectedEventType) return [];

  const parts = BookingState.selectedDate.split('-');
  const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const duration = BookingState.selectedEventType.duration;
  const interval = BOOKING_CONFIG.slotIntervalMinutes;
  const bookedSlots = MOCK_BOOKED_SLOTS[BookingState.selectedDate] || [];
  const slots = [];

  for (let hour = BOOKING_CONFIG.workStart; hour < BOOKING_CONFIG.workEnd; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, min, 0, 0);

      // Skip past times (M04-R03F)
      if (slotTime <= now) continue;

      // Min advance check
      const diffHours = (slotTime - now) / (1000 * 60 * 60);
      if (diffHours < BOOKING_CONFIG.minAdvanceHours) continue;

      // Check if slot end overflows work hours
      const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);
      if (slotEnd.getHours() > BOOKING_CONFIG.workEnd ||
          (slotEnd.getHours() === BOOKING_CONFIG.workEnd && slotEnd.getMinutes() > 0)) continue;

      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const isBooked = bookedSlots.includes(timeStr);

      // Check if duration overlaps with a booked slot
      let overlapsBooked = false;
      if (!isBooked) {
        for (let offsetMin = interval; offsetMin < duration; offsetMin += interval) {
          const checkTime = new Date(slotTime.getTime() + offsetMin * 60 * 1000);
          const checkStr = `${String(checkTime.getHours()).padStart(2, '0')}:${String(checkTime.getMinutes()).padStart(2, '0')}`;
          if (bookedSlots.includes(checkStr)) {
            overlapsBooked = true;
            break;
          }
        }
      }

      slots.push({
        time: timeStr,
        available: !isBooked && !overlapsBooked,
        locked: false,
      });
    }
  }

  return slots;
}

function renderTimeSlots(container, slots) {
  const availableSlots = slots.filter(s => s.available);
  const unavailableSlots = slots.filter(s => !s.available);

  let html = '<div class="time-slots-grid">';

  slots.forEach(slot => {
    const isSelected = BookingState.selectedSlot === slot.time;
    let cls = 'time-slot';
    if (!slot.available) cls += ' disabled';
    if (slot.locked) cls += ' locked';
    if (isSelected) cls += ' selected';

    const timeDisplay = formatTime12h(slot.time);

    html += `
      <button class="${cls}"
              ${!slot.available || slot.locked ? 'disabled' : ''}
              onclick="selectTimeSlot('${slot.time}')"
              aria-label="Horario ${timeDisplay.time} ${timeDisplay.period}">
        <span class="time-slot-time">${timeDisplay.time}</span>
        <span class="time-slot-period">${timeDisplay.period}</span>
        ${slot.locked ? '<span class="lock-icon">🔒</span>' : ''}
      </button>
    `;
  });

  html += '</div>';

  // Polling indicator
  html += `
    <div id="polling-indicator" class="polling-indicator">
      <span class="polling-dot"></span>
      <span>Disponibilidad actualizada en tiempo real</span>
    </div>
  `;

  container.innerHTML = html;

  // Check if all slots are booked → show suggestions (M04-R01F)
  if (availableSlots.length === 0) {
    renderNoSlots(container);
  }
}

function renderNoSlots(container) {
  const suggestions = findNearestSuggestions(3);

  let suggestionsHtml = '';
  if (suggestions.length > 0) {
    suggestionsHtml = `
      <div class="suggestions-panel">
        <div class="suggestions-header">
          <svg class="suggestions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
          <span class="suggestions-title">Turnos alternativos sugeridos</span>
        </div>
        <p class="suggestions-text">No hay disponibilidad en la fecha seleccionada. Te sugerimos estos horarios cercanos:</p>
        <div class="suggestions-list">
          ${suggestions.map(s => `
            <button class="suggestion-item" onclick="selectSuggestion('${s.date}', '${s.time}')">
              <div class="suggestion-info">
                <span class="suggestion-date">${s.displayDate}</span>
                <span class="suggestion-time">${s.displayTime} · ${BookingState.selectedEventType.name}</span>
              </div>
              <svg class="suggestion-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="no-slots">
      <svg class="no-slots-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="9" y1="15" x2="15" y2="15" stroke-dasharray="2 2"/>
      </svg>
      <h3 class="no-slots-title">Sin disponibilidad</h3>
      <p class="no-slots-text">No hay horarios disponibles para este día.</p>
    </div>
    ${suggestionsHtml}
  `;
}

/** ==========================================
 *  SUGGESTIONS (M04-R01F)
 *  ========================================== */
function findNearestSuggestions(count) {
  const suggestions = [];
  if (!BookingState.selectedDate || !BookingState.selectedEventType) return suggestions;

  const parts = BookingState.selectedDate.split('-');
  const baseDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const duration = BookingState.selectedEventType.duration;
  const interval = BOOKING_CONFIG.slotIntervalMinutes;

  // Search up to 14 days forward
  for (let dayOffset = 0; dayOffset <= 14 && suggestions.length < count; dayOffset++) {
    const checkDate = new Date(baseDate);
    checkDate.setDate(baseDate.getDate() + dayOffset);

    if (isDateBlocked(checkDate)) continue;

    const dateStr = formatDateKey(checkDate);
    const booked = MOCK_BOOKED_SLOTS[dateStr] || [];

    for (let hour = BOOKING_CONFIG.workStart; hour < BOOKING_CONFIG.workEnd && suggestions.length < count; hour++) {
      for (let min = 0; min < 60 && suggestions.length < count; min += interval) {
        const slotTime = new Date(checkDate);
        slotTime.setHours(hour, min, 0, 0);

        if (slotTime <= now) continue;
        const diffHours = (slotTime - now) / (1000 * 60 * 60);
        if (diffHours < BOOKING_CONFIG.minAdvanceHours) continue;

        const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);
        if (slotEnd.getHours() > BOOKING_CONFIG.workEnd) continue;

        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        if (booked.includes(timeStr)) continue;

        // Check overlap
        let overlaps = false;
        for (let oMin = interval; oMin < duration; oMin += interval) {
          const oTime = new Date(slotTime.getTime() + oMin * 60 * 1000);
          const oStr = `${String(oTime.getHours()).padStart(2, '0')}:${String(oTime.getMinutes()).padStart(2, '0')}`;
          if (booked.includes(oStr)) { overlaps = true; break; }
        }
        if (overlaps) continue;

        const dayName = DAY_NAMES[checkDate.getDay()];
        const monthName = MONTH_NAMES[checkDate.getMonth()];
        const t12 = formatTime12h(timeStr);

        suggestions.push({
          date: dateStr,
          time: timeStr,
          displayDate: `${dayName} ${checkDate.getDate()} de ${monthName}`,
          displayTime: `${t12.time} ${t12.period}`,
        });
      }
    }
  }

  return suggestions;
}

function selectSuggestion(dateStr, timeStr) {
  BookingState.selectedDate = dateStr;
  BookingState.selectedSlot = timeStr;
  showToast('success', 'Sugerencia seleccionada');
  startSessionTimer();
  goToStep(3);
}

/** ==========================================
 *  TIME SLOT SELECTION (M04-R04F)
 *  ========================================== */
function selectTimeSlot(timeStr) {
  BookingState.selectedSlot = timeStr;

  // Visual feedback
  document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
  const btn = document.querySelector(`.time-slot[onclick="selectTimeSlot('${timeStr}')"]`);
  if (btn) btn.classList.add('selected');

  // Start timer (M04-R05F)
  if (!BookingState.timerActive) {
    startSessionTimer();
  }

  showToast('success', `Horario bloqueado: ${formatTime12h(timeStr).time} ${formatTime12h(timeStr).period}`);
  updateFooterButtons();
}

/** ==========================================
 *  SESSION TIMER (M04-R05F, M04-R01NF)
 *  ========================================== */
function startSessionTimer() {
  if (BookingState.timerActive) return;

  BookingState.timerActive = true;
  BookingState.timerStartTime = Date.now();

  // Show timer UI
  const timerBar = getEl('timer-bar');
  const timerDisplay = getEl('timer-display');
  if (timerBar) timerBar.classList.add('active');
  if (timerDisplay) timerDisplay.classList.add('active');

  BookingState.timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
}

function updateTimer() {
  if (!BookingState.timerActive) return;

  const elapsed = Date.now() - BookingState.timerStartTime;
  const remaining = BOOKING_CONFIG.sessionTimeoutMs - elapsed;

  if (remaining <= 0) {
    expireSession();
    return;
  }

  // Update timer display
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const display = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const timerDisplay = getEl('timer-display');
  const timerBarFill = getEl('timer-bar-fill');

  if (timerDisplay) {
    timerDisplay.querySelector('.timer-text').textContent = display;

    timerDisplay.classList.remove('warning', 'critical');
    if (remaining <= BOOKING_CONFIG.criticalThresholdMs) {
      timerDisplay.classList.add('critical');
    } else if (remaining <= BOOKING_CONFIG.warningThresholdMs) {
      timerDisplay.classList.add('warning');
    }
  }

  if (timerBarFill) {
    const pct = (remaining / BOOKING_CONFIG.sessionTimeoutMs) * 100;
    timerBarFill.style.width = `${pct}%`;

    timerBarFill.classList.remove('warning', 'critical');
    if (remaining <= BOOKING_CONFIG.criticalThresholdMs) {
      timerBarFill.classList.add('critical');
    } else if (remaining <= BOOKING_CONFIG.warningThresholdMs) {
      timerBarFill.classList.add('warning');
    }
  }
}

function expireSession() {
  BookingState.isExpired = true;
  BookingState.timerActive = false;
  clearInterval(BookingState.timerInterval);
  stopPolling();

  // Hide all steps + footer
  document.querySelectorAll('.booking-step').forEach(el => el.classList.remove('active'));
  getEl('booking-footer').style.display = 'none';

  // Show expired screen
  getEl('expired-screen').classList.add('active');

  showToast('warning', 'Tu sesión ha expirado');
}

function restartBooking() {
  // Reset state
  BookingState.currentStep = 1;
  BookingState.selectedEventType = null;
  BookingState.selectedDate = null;
  BookingState.selectedSlot = null;
  BookingState.timerActive = false;
  BookingState.isExpired = false;
  BookingState.guestData = { fullName: '', email: '', phone: '', note: '' };

  clearInterval(BookingState.timerInterval);
  stopPolling();

  // Reset UI
  const timerBar = getEl('timer-bar');
  const timerDisplay = getEl('timer-display');
  const timerBarFill = getEl('timer-bar-fill');
  if (timerBar) timerBar.classList.remove('active');
  if (timerDisplay) timerDisplay.classList.remove('active', 'warning', 'critical');
  if (timerBarFill) {
    timerBarFill.style.width = '100%';
    timerBarFill.classList.remove('warning', 'critical');
  }

  getEl('expired-screen').classList.remove('active');
  getEl('success-screen').classList.remove('active');
  getEl('booking-footer').style.display = '';

  goToStep(1);
  renderStep1();
}

/** ==========================================
 *  POLLING (M04-R09F)
 *  ========================================== */
function startPolling() {
  if (BookingState.pollingInterval) return;

  BookingState.pollingActive = true;
  BookingState.pollingInterval = setInterval(() => {
    if (!BookingState.pollingActive) return;

    // Check idle
    const idleTime = Date.now() - BookingState.lastInteractionTime;
    if (idleTime > BOOKING_CONFIG.idleTimeoutMs) {
      pausePolling();
      return;
    }

    // Refresh slots
    if (BookingState.currentStep === 2) {
      refreshSlots();
    }
  }, BOOKING_CONFIG.pollingIntervalMs);

  updatePollingIndicator(true);
}

function pausePolling() {
  BookingState.pollingActive = false;
  updatePollingIndicator(false);
}

function resumePolling() {
  BookingState.pollingActive = true;
  updatePollingIndicator(true);
}

function stopPolling() {
  clearInterval(BookingState.pollingInterval);
  BookingState.pollingInterval = null;
  BookingState.pollingActive = false;
}

function refreshSlots() {
  // In production: API call. Here: re-render with mock data
  if (BookingState.currentStep === 2) {
    const container = getEl('time-slots-container');
    const slots = generateTimeSlots();
    if (slots.length === 0) {
      renderNoSlots(container);
    } else {
      renderTimeSlots(container, slots);
    }
  }
}

function updatePollingIndicator(active) {
  const indicator = getEl('polling-indicator');
  if (!indicator) return;
  if (active) {
    indicator.classList.remove('paused');
    indicator.querySelector('span:last-child').textContent = 'Disponibilidad actualizada en tiempo real';
  } else {
    indicator.classList.add('paused');
    indicator.querySelector('span:last-child').textContent = 'Actualización pausada (sin actividad)';
  }
}

/** ==========================================
 *  IDLE DETECTION (M04-R09F)
 *  ========================================== */
function setupIdleDetection() {
  const events = ['touchstart', 'mousemove', 'mousedown', 'keydown', 'scroll'];
  events.forEach(evt => {
    document.addEventListener(evt, recordInteraction, { passive: true });
  });
}

function recordInteraction() {
  BookingState.lastInteractionTime = Date.now();
  if (!BookingState.pollingActive && BookingState.pollingInterval) {
    resumePolling();
  }
}

/** ==========================================
 *  STEP 3: Guest Data Form (M04-R06F)
 *  ========================================== */
function renderStep3Focus() {
  setTimeout(() => {
    const nameInput = getEl('guest-fullname');
    if (nameInput) nameInput.focus();
  }, 400);
}

function setupFormValidation() {
  // Real-time validation
  const nameInput = getEl('guest-fullname');
  const emailInput = getEl('guest-email');

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      BookingState.guestData.fullName = nameInput.value.trim();
      validateField(nameInput, nameInput.value.trim().length >= 3);
      updateFooterButtons();
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      BookingState.guestData.email = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
      validateField(emailInput, isValid);
      updateFooterButtons();
    });
  }

  const phoneInput = getEl('guest-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      BookingState.guestData.phone = phoneInput.value.trim();
    });
  }

  const noteInput = getEl('guest-note');
  if (noteInput) {
    noteInput.addEventListener('input', () => {
      BookingState.guestData.note = noteInput.value.trim();
    });
  }
}

function validateField(input, isValid) {
  input.classList.remove('error', 'form-input-valid');
  if (input.value.trim() === '') return;
  input.classList.add(isValid ? 'form-input-valid' : 'error');

  // Error message
  const errorEl = input.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.style.display = isValid ? 'none' : 'flex';
  }
}

function isFormValid() {
  const { fullName, email } = BookingState.guestData;
  return fullName.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** ==========================================
 *  STEP 4: Confirmation (M04-R07F)
 *  ========================================== */
function renderStep4() {
  const { selectedEventType, selectedDate, selectedSlot, guestData } = BookingState;
  if (!selectedEventType || !selectedDate || !selectedSlot) return;

  const parts = selectedDate.split('-');
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayName = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[dateObj.getMonth()];
  const t12 = formatTime12h(selectedSlot);

  getEl('confirm-event-name').textContent = selectedEventType.name;
  getEl('confirm-event-meta').textContent = `${selectedEventType.duration} min · ${capitalize(selectedEventType.modality)}`;
  getEl('confirm-date').textContent = `${dayName} ${parts[2]} de ${monthName}, ${parts[0]}`;
  getEl('confirm-time').textContent = `${t12.time} ${t12.period} (${BookingState.timezone.replace(/_/g, ' ')})`;
  getEl('confirm-name').textContent = guestData.fullName;
  getEl('confirm-email').textContent = guestData.email;

  const extraInfo = getEl('confirm-extra');
  if (extraInfo) {
    const extras = [];
    if (guestData.phone) extras.push(`Tel: ${guestData.phone}`);
    if (guestData.note) extras.push(`Nota: ${guestData.note}`);
    extraInfo.textContent = extras.join(' · ') || 'Sin información adicional';
  }
}

function confirmBooking() {
  // Show loading
  const btn = getEl('btn-confirm-booking');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="slots-loading-spinner" style="width:20px;height:20px;border-width:2px;"></span> Confirmando...';
  }

  // Simulate API call
  setTimeout(() => {
    BookingState.timerActive = false;
    clearInterval(BookingState.timerInterval);
    stopPolling();

    // Hide steps + footer
    document.querySelectorAll('.booking-step').forEach(el => el.classList.remove('active'));
    getEl('booking-footer').style.display = 'none';

    // Hide timer
    const timerBar = getEl('timer-bar');
    const timerDisplay = getEl('timer-display');
    if (timerBar) timerBar.classList.remove('active');
    if (timerDisplay) timerDisplay.classList.remove('active');

    // Generate ref number
    const ref = `HA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    getEl('booking-ref-code').textContent = `Ref: ${ref}`;

    // Show success
    getEl('success-screen').classList.add('active');

    showToast('success', '¡Reserva confirmada exitosamente!');
  }, 1500);
}

/** ==========================================
 *  FOOTER BUTTONS
 *  ========================================== */
function updateFooterButtons() {
  const backBtn = getEl('btn-back');
  const nextBtn = getEl('btn-next');
  if (!backBtn || !nextBtn) return;

  const step = BookingState.currentStep;

  // Back button
  backBtn.style.display = step === 1 ? 'none' : '';

  // Next button
  switch (step) {
    case 1:
      nextBtn.disabled = false;
      nextBtn.textContent = 'Seleccionar Horario';
      nextBtn.onclick = () => {
        if (!BookingState.selectedEventType) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Tipo de Consulta" está vacío y es obligatorio. Por favor, selecciona una consulta.',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          return;
        }
        if (!BookingState.selectedDate) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Fecha de consulta" está vacío y es obligatorio. Por favor, selecciona un día en el calendario.',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          return;
        }
        goToStep(2);
      };
      nextBtn.className = 'btn btn-primary';
      break;
    case 2:
      nextBtn.disabled = false;
      nextBtn.textContent = 'Continuar';
      nextBtn.onclick = () => {
        if (!BookingState.selectedSlot) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Horario" está vacío y es obligatorio. Por favor, selecciona una de las horas disponibles.',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          return;
        }
        goToStep(3);
      };
      nextBtn.className = 'btn btn-primary';
      break;
    case 3:
      nextBtn.disabled = false;
      nextBtn.textContent = 'Revisar Reserva';
      nextBtn.onclick = () => {
        const nameInput = getEl('guest-fullname');
        const emailInput = getEl('guest-email');
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';

        if (!nameVal) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Nombre completo" está vacío y es obligatorio.',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          if (nameInput) {
            nameInput.classList.add('error');
            nameInput.classList.remove('form-input-valid');
            const errorEl = nameInput.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.style.display = 'flex';
            nameInput.focus();
          }
          return;
        }

        if (nameVal.length < 3) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Nombre completo" debe tener al menos 3 caracteres.',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          if (nameInput) {
            nameInput.classList.add('error');
            nameInput.classList.remove('form-input-valid');
            nameInput.focus();
          }
          return;
        }

        if (!emailVal) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Correo electrónico" está vacío y es obligatorio.',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          if (emailInput) {
            emailInput.classList.add('error');
            emailInput.classList.remove('form-input-valid');
            const errorEl = emailInput.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.style.display = 'flex';
            emailInput.focus();
          }
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
          ConfirmDialog.show({
            title: 'Campo obligatorio requerido',
            message: 'El campo "Correo electrónico" no tiene un formato válido (Ej: usuario@dominio.com).',
            confirmText: 'Entendido',
            type: 'warning',
            singleButton: true
          });
          if (emailInput) {
            emailInput.classList.add('error');
            emailInput.classList.remove('form-input-valid');
            emailInput.focus();
          }
          return;
        }

        syncFormData();
        goToStep(4);
      };
      nextBtn.className = 'btn btn-primary';
      break;
    case 4:
      nextBtn.disabled = false;
      nextBtn.textContent = 'Confirmar Reserva';
      nextBtn.id = 'btn-confirm-booking';
      nextBtn.onclick = confirmBooking;
      nextBtn.className = 'btn btn-success';
      break;
  }
}

function syncFormData() {
  const nameInput = getEl('guest-fullname');
  const emailInput = getEl('guest-email');
  const phoneInput = getEl('guest-phone');
  const noteInput = getEl('guest-note');

  if (nameInput) BookingState.guestData.fullName = nameInput.value.trim();
  if (emailInput) BookingState.guestData.email = emailInput.value.trim();
  if (phoneInput) BookingState.guestData.phone = phoneInput.value.trim();
  if (noteInput) BookingState.guestData.note = noteInput.value.trim();
}

function goBack() {
  if (BookingState.currentStep > 1) {
    goToStep(BookingState.currentStep - 1);
  }
}

/** ==========================================
 *  TOAST NOTIFICATIONS (M04-RF08)
 *  ========================================== */
function showToast(type, message) {
  const container = getEl('booking-toast-container');
  if (!container) return;

  const iconMap = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/** ==========================================
 *  UTILITIES
 *  ========================================== */
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return { time: `${hour12}:${String(m).padStart(2, '0')}`, period };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** ==========================================
 *  BOOT
 *  ========================================== */
document.addEventListener('DOMContentLoaded', initBooking);
