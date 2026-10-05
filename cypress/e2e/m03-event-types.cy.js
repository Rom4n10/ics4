describe('AgendaYA - M03 Tipos de Evento', () => {
  beforeEach(() => {
    // Cada caso empieza desde la pantalla principal para no depender del estado
    // dejado por el test anterior.
    cy.visit('ics/index.html', {
      onBeforeLoad(win) {
        // Se omite el tutorial inicial para que sus elementos no cubran la UI.
        win.localStorage.setItem('tutorial_dismissed', 'true');
      }
    });
  });

  it('(HP) Camino exitoso de crear tipo de evento', () => {
    // Arrange: generar un nombre único y abrir el formulario de alta.
    const uniqueName = `Consulta Cardiológica ${Date.now()}`;
    cy.get('[data-cy="btn-new-event"]').click();
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('#form-modal-title').should('contain.text', 'Nuevo Tipo de Evento');
    // Completar los campos obligatorios y seleccionar duración y modalidad.
    cy.get('[data-cy="field-name"]').type(uniqueName);
    cy.get('[data-cy="field-description"]').type('Evaluación cardiológica integral para chequeo preventivo.');
    cy.get('[data-cy="duration-30"]').click();
    cy.get('[data-cy="modality-presencial"]').click();

    // Act: guardar el nuevo tipo de evento.
    cy.get('[data-cy="form-submit-btn"]').click();

    // Assert: el modal se cierra y la nueva fila muestra los datos guardados.
    cy.get('[data-cy="form-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', uniqueName).should('be.visible');
    cy.contains('[data-cy="event-row"]', uniqueName).should('contain.text', '30 min');
    cy.contains('[data-cy="event-row"]', uniqueName).should('contain.text', 'Presencial');
  });

  it('(SAD) Campos vacíos en crear tipo de evento error', () => {
    // Arrange: abrir el alta y dejar vacío el nombre obligatorio.
    cy.get('[data-cy="btn-new-event"]').click();
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('[data-cy="field-name"]').clear();

    // Act: intentar guardar sin completar el nombre.
    cy.get('[data-cy="form-submit-btn"]').click();

    // Assert: el formulario permanece abierto y muestra el error de validación.
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('[data-cy="field-name"]').should('have.class', 'error');
    cy.get('[data-cy="field-name-error"]')
      .should('be.visible')
      .and('contain.text', 'El nombre es obligatorio');
  });

  it('(HP) Editar tipo de evento exitoso', () => {
    // Arrange: abrir la edición del primer registro y preparar sus nuevos datos.
    const updatedName = `Consulta Modificada ${Date.now()}`;
    cy.get('[data-cy="event-row"]').first().within(() => {
      cy.get('[data-cy="btn-edit-event"]').click();
    });
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('#form-modal-title').should('contain.text', 'Editar Tipo de Evento');
    cy.get('[data-cy="field-name"]').clear().type(updatedName);
    cy.get('[data-cy="duration-45"]').click();

    // Act: guardar los cambios del tipo de evento.
    cy.get('[data-cy="form-submit-btn"]').click();

    // Assert: la edición cierra el modal y actualiza nombre y duración.
    cy.get('[data-cy="form-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', updatedName).should('be.visible');
    cy.contains('[data-cy="event-row"]', updatedName).should('contain.text', '45 min');
  });

  it('(HP) Dar de baja un tipo de evento exitoso', () => {
    // Arrange: solicitar el cambio de estado del primer registro.
    cy.get('[data-cy="event-row"]').first().within(() => {
      cy.get('[data-cy="btn-toggle-status"]').click();
    });

    // Act: confirmar la baja desde el diálogo de confirmación.
    cy.get('[data-cy="confirm-modal"]').should('have.class', 'open');
    cy.get('[data-cy="confirm-action-btn"]').click();

    // Assert: el diálogo se cierra y la fila pasa a estado Inactivo.
    cy.get('[data-cy="confirm-modal"]').should('not.have.class', 'open');
    cy.get('[data-cy="event-row"]').first().should('contain.text', 'Inactivo');
  });
});

