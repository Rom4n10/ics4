/* ============================================
   Form Module - Create / Edit Event Type
   ============================================ */

const FormModule = (() => {
  let editingId = null;
  let selectedDuration = null;
  let customDuration = false;
  let selectedModality = null;
  let selectedConfirmation = 'auto';
  let uploadedFiles = [];

  function openCreate() {
    resetForm();
    document.getElementById('form-modal-title').textContent = 'Nuevo Tipo de Evento';
    document.getElementById('form-submit-btn').textContent = 'Crear Tipo de Evento';
    ModalManager.open('form-modal');

    // Show tutorial if not dismissed
    if (!localStorage.getItem('tutorial_dismissed')) {
      setTimeout(() => TutorialModule.start(), 500);
    }
  }

  function openEdit(id) {
    const event = AppState.eventTypes.find(e => e.id === id);
    if (!event) return;

    resetForm();
    editingId = id;
    document.getElementById('form-modal-title').textContent = 'Editar Tipo de Evento';
    document.getElementById('form-submit-btn').textContent = 'Guardar Cambios';

    // Populate fields
    document.getElementById('field-name').value = event.name;
    document.getElementById('field-description').value = event.description || '';

    // Duration
    if (DURATION_PRESETS.includes(event.duration)) {
      selectDuration(event.duration);
    } else {
      selectCustomDuration(event.duration);
    }

    // Modality
    selectModality(event.modality);

    // Confirmation
    selectConfirmation(event.confirmation);

    ModalManager.open('form-modal');
  }

  function openDuplicate(event) {
    resetForm();
    document.getElementById('form-modal-title').textContent = 'Duplicar Tipo de Evento';
    document.getElementById('form-submit-btn').textContent = 'Crear Copia';

    // Populate with source data but new name
    document.getElementById('field-name').value = `${event.name} (Copia)`;
    document.getElementById('field-description').value = event.description || '';

    if (DURATION_PRESETS.includes(event.duration)) {
      selectDuration(event.duration);
    } else {
      selectCustomDuration(event.duration);
    }

    selectModality(event.modality);
    selectConfirmation(event.confirmation);

    ModalManager.open('form-modal');
  }

  function resetForm() {
    editingId = null;
    selectedDuration = null;
    customDuration = false;
    selectedModality = null;
    selectedConfirmation = 'auto';
    uploadedFiles = [];

    const nameField = document.getElementById('field-name');
    const descField = document.getElementById('field-description');
    if (nameField) nameField.value = '';
    if (descField) descField.value = '';

    clearDurationSelection();
    clearModalitySelection();
    clearErrors();
    updateCustomDurationVisibility();
    updateConfirmationUI();
    updateUploadPreview();
  }

  function init() {
    bindDurationPills();
    bindModalityCards();
    bindConfirmationToggle();
    bindSubmit();
    bindNameValidation();
    bindUploadZone();
  }

  /* --- Duration --- */
  function bindDurationPills() {
    document.querySelectorAll('.duration-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.dataset.duration;
        if (val === 'custom') {
          customDuration = true;
          selectedDuration = null;
          clearDurationSelection();
          pill.classList.add('custom-active');
          updateCustomDurationVisibility();
        } else {
          selectDuration(parseInt(val));
        }
      });
    });

    const customInput = document.getElementById('custom-duration-input');
    if (customInput) {
      customInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) {
          selectedDuration = val;
        }
      });
    }
  }

  function selectDuration(value) {
    selectedDuration = value;
    customDuration = false;
    clearDurationSelection();
    const pill = document.querySelector(`.duration-pill[data-duration="${value}"]`);
    if (pill) pill.classList.add('active');
    updateCustomDurationVisibility();
  }

  function selectCustomDuration(value) {
    customDuration = true;
    selectedDuration = value;
    clearDurationSelection();
    const pill = document.querySelector('.duration-pill[data-duration="custom"]');
    if (pill) pill.classList.add('custom-active');
    const input = document.getElementById('custom-duration-input');
    if (input) input.value = value;
    updateCustomDurationVisibility();
  }

  function clearDurationSelection() {
    document.querySelectorAll('.duration-pill').forEach(p => {
      p.classList.remove('active', 'custom-active');
    });
  }

  function updateCustomDurationVisibility() {
    const el = document.getElementById('custom-duration-group');
    if (el) {
      el.classList.toggle('visible', customDuration);
    }
  }

  /* --- Modality --- */
  function bindModalityCards() {
    document.querySelectorAll('.modality-card').forEach(card => {
      card.addEventListener('click', () => {
        selectModality(card.dataset.modality);
      });
    });
  }

  function selectModality(value) {
    selectedModality = value;
    clearModalitySelection();
    const card = document.querySelector(`.modality-card[data-modality="${value}"]`);
    if (card) card.classList.add('active');
  }

  function clearModalitySelection() {
    document.querySelectorAll('.modality-card').forEach(c => c.classList.remove('active'));
  }

  /* --- Confirmation --- */
  function bindConfirmationToggle() {
    const toggle = document.getElementById('confirmation-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        selectedConfirmation = toggle.checked ? 'manual' : 'auto';
        updateConfirmationUI();
      });
    }
  }

  function selectConfirmation(value) {
    selectedConfirmation = value;
    const toggle = document.getElementById('confirmation-toggle');
    if (toggle) toggle.checked = value === 'manual';
    updateConfirmationUI();
  }

  function updateConfirmationUI() {
    const label = document.getElementById('confirmation-label');
    if (label) {
      label.textContent = selectedConfirmation === 'manual'
        ? 'Confirmación Manual'
        : 'Confirmación Automática';
    }
  }

  /* --- Upload --- */
  function bindUploadZone() {
    const zone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    if (!zone || !fileInput) return;

    zone.addEventListener('click', () => fileInput.click());

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      fileInput.value = '';
    });
  }

  function handleFiles(fileList) {
    const allowed = ['image/jpeg', 'image/png', 'video/mp4'];
    Array.from(fileList).forEach(file => {
      if (allowed.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFiles.push({
            name: file.name,
            type: file.type,
            url: e.target.result
          });
          updateUploadPreview();
        };
        reader.readAsDataURL(file);
      } else {
        Toast.show(`Formato no soportado: ${file.name}. Solo JPG, PNG y MP4.`, 'error');
      }
    });
  }

  function updateUploadPreview() {
    const container = document.getElementById('upload-preview');
    if (!container) return;
    container.innerHTML = uploadedFiles.map((file, idx) => `
      <div class="upload-preview-item">
        ${file.type.startsWith('image/')
          ? `<img src="${file.url}" alt="${file.name}">`
          : `<video src="${file.url}" muted></video>`}
        <button class="upload-preview-remove" data-idx="${idx}" title="Eliminar">×</button>
      </div>
    `).join('');

    container.querySelectorAll('.upload-preview-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedFiles.splice(parseInt(btn.dataset.idx), 1);
        updateUploadPreview();
      });
    });
  }

  /* --- Validation --- */
  function bindNameValidation() {
    const field = document.getElementById('field-name');
    if (!field) return;

    field.addEventListener('input', () => {
      clearErrors();
      const name = field.value.trim();
      if (name) {
        const duplicate = AppState.eventTypes.find(
          e => e.name.toLowerCase() === name.toLowerCase() && e.id !== editingId
        );
        if (duplicate) {
          showFieldError('field-name', 'Ya existe un tipo de evento con este nombre');
        }
      }
    });
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    let errorEl = field.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${message}`;
  }

  function clearErrors() {
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => el.remove());
  }

  function validate() {
    clearErrors();
    let valid = true;

    const name = document.getElementById('field-name').value.trim();
    if (!name) {
      showFieldError('field-name', 'El nombre es obligatorio');
      valid = false;
    } else {
      const dup = AppState.eventTypes.find(
        e => e.name.toLowerCase() === name.toLowerCase() && e.id !== editingId
      );
      if (dup) {
        showFieldError('field-name', 'Ya existe un tipo de evento con este nombre');
        valid = false;
      }
    }

    if (!selectedDuration || selectedDuration <= 0) {
      Toast.show('Debes seleccionar una duración', 'error');
      valid = false;
    }

    if (!selectedModality) {
      Toast.show('Debes seleccionar una modalidad', 'error');
      valid = false;
    }

    return valid;
  }

  /* --- Submit --- */
  function bindSubmit() {
    const btn = document.getElementById('form-submit-btn');
    if (btn) {
      btn.addEventListener('click', handleSubmit);
    }
  }

  function handleSubmit() {
    if (!validate()) return;

    const data = {
      name: document.getElementById('field-name').value.trim(),
      description: document.getElementById('field-description').value.trim(),
      duration: selectedDuration,
      modality: selectedModality,
      confirmation: selectedConfirmation,
      mediaFiles: [...uploadedFiles]
    };

    if (editingId) {
      // Edit existing
      const event = AppState.eventTypes.find(e => e.id === editingId);
      if (event) {
        Object.assign(event, data, { updatedAt: new Date().toISOString() });
        Toast.show(`"${data.name}" actualizado correctamente`, 'success');
      }
    } else {
      // Create new
      const newEvent = {
        id: generateId(),
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      AppState.eventTypes.unshift(newEvent);
      Toast.show(`tipo de evento creado operacion exitosa<br><small>Resumen: ${data.name} | ${data.duration} min | ${data.modality}</small>`, 'success', 5000);
    }

    ModalManager.close('form-modal');
    TableModule.render();
  }

  return { init, openCreate, openEdit, openDuplicate };
})();
