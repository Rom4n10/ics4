describe('AgendaYA - M03 Tipos de Evento', () => {
  beforeEach(() => {
    // URL local del frontend (evita que el tutorial de bienvenida bloquee la interfaz)
    cy.visit('ics/index.html', {
      onBeforeLoad(win) {
        win.localStorage.setItem('tutorial_dismissed', 'true');
      }
    });
  });

  it('(HP) Camino exitoso de crear tipo de evento', () => {
    // Arrange: preparar el estado inicial
    const uniqueName = `Consulta Cardiológica ${Date.now()}`;
    cy.get('[data-cy="btn-new-event"]').click();
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('#form-modal-title').should('contain.text', 'Nuevo Tipo de Evento');
    cy.get('[data-cy="field-name"]').type(uniqueName);
    cy.get('[data-cy="field-description"]').type('Evaluación cardiológica integral para chequeo preventivo.');
    cy.get('[data-cy="duration-30"]').click();
    cy.get('[data-cy="modality-presencial"]').click();

    // Act: ejecutar la acción principal
    cy.get('[data-cy="form-submit-btn"]').click();

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="form-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', uniqueName).should('be.visible');
    cy.contains('[data-cy="event-row"]', uniqueName).should('contain.text', '30 min');
    cy.contains('[data-cy="event-row"]', uniqueName).should('contain.text', 'Presencial');
  });

  it('(SAD) Campos vacíos en crear tipo de evento error', () => {
    // Arrange: preparar el estado inicial
    cy.get('[data-cy="btn-new-event"]').click();
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('[data-cy="field-name"]').clear();

    // Act: ejecutar la acción principal
    cy.get('[data-cy="form-submit-btn"]').click();

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('[data-cy="field-name"]').should('have.class', 'error');
    cy.get('[data-cy="field-name-error"]')
      .should('be.visible')
      .and('contain.text', 'El nombre es obligatorio');
  });

  it('(HP) Editar tipo de evento exitoso', () => {
    // Arrange: preparar el estado inicial
    const updatedName = `Consulta Modificada ${Date.now()}`;
    cy.get('[data-cy="event-row"]').first().within(() => {
      cy.get('[data-cy="btn-edit-event"]').click();
    });
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('#form-modal-title').should('contain.text', 'Editar Tipo de Evento');
    cy.get('[data-cy="field-name"]').clear().type(updatedName);
    cy.get('[data-cy="duration-45"]').click();

    // Act: ejecutar la acción principal
    cy.get('[data-cy="form-submit-btn"]').click();

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="form-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', updatedName).should('be.visible');
    cy.contains('[data-cy="event-row"]', updatedName).should('contain.text', '45 min');
  });

  it('(HP) Dar de baja un tipo de evento exitoso', () => {
    // Arrange: preparar el estado inicial haciendo clic en el botón de cambiar estado de la primera fila
    cy.get('[data-cy="event-row"]').first().within(() => {
      cy.get('[data-cy="btn-toggle-status"]').click();
    });

    // Act: confirmar la deshabilitación en el modal de confirmación
    cy.get('[data-cy="confirm-modal"]').should('have.class', 'open');
    cy.get('[data-cy="confirm-action-btn"]').click();

    // Assert: verificar que el modal se cierre y la fila quede en estado Inactivo
    cy.get('[data-cy="confirm-modal"]').should('not.have.class', 'open');
    cy.get('[data-cy="event-row"]').first().should('contain.text', 'Inactivo');
  });
});

