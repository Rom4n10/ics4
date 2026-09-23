describe('AgendaYA - M03 Dar de baja tipo de evento', () => {
  beforeEach(() => {
    // URL local del frontend (evita que el tutorial de bienvenida bloquee la interfaz)
    cy.visit('ics/index.html', {
      onBeforeLoad(win) {
        win.localStorage.setItem('tutorial_dismissed', 'true');
      }
    });
  });

  it('(HP) Dar de baja lógica a un tipo de evento', () => {
    // Arrange: preparar el estado inicial creando un nuevo tipo de evento activo
    const uniqueName = `Consulta para Baja ${Date.now()}`;
    cy.get('[data-cy="btn-new-event"]').click();
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('#form-modal-title').should('contain.text', 'Nuevo Tipo de Evento');
    cy.get('[data-cy="field-name"]').type(uniqueName);
    cy.get('[data-cy="field-description"]').type('Tipo de evento creado para verificar la baja lógica.');
    cy.get('[data-cy="duration-30"]').click();
    cy.get('[data-cy="modality-presencial"]').click();
    cy.get('[data-cy="form-submit-btn"]').click();

    cy.get('[data-cy="form-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', uniqueName).should('be.visible');
    cy.contains('[data-cy="event-row"]', uniqueName).should('contain.text', 'Activo');

    // Act: ejecutar la acción principal (solicitar baja lógica y confirmar)
    cy.contains('[data-cy="event-row"]', uniqueName).within(() => {
      cy.get('[data-cy="btn-toggle-status"]').click();
    });

    cy.get('[data-cy="confirm-modal"]').should('have.class', 'open');
    cy.get('[data-cy="confirm-title"]').should('contain.text', '¿Dar de baja este tipo de evento?');
    cy.get('[data-cy="confirm-action-btn"]').click();

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="confirm-modal"]').should('not.have.class', 'open');
    cy.get('[data-cy="toast-success"]')
      .should('be.visible')
      .and('contain.text', 'baja confirmada');

    cy.contains('[data-cy="event-row"]', uniqueName).within(() => {
      cy.get('.badge-inactive').should('contain.text', 'Inactivo');
      cy.get('[data-cy="btn-toggle-status"]').should('have.attr', 'title', 'Reactivar');
    });
  });

  it('(SAD) Cancelar confirmación de dar de baja lógica mantiene el estado activo', () => {
    // Arrange: preparar el estado inicial
    const uniqueName = `Consulta Activa ${Date.now()}`;
    cy.get('[data-cy="btn-new-event"]').click();
    cy.get('[data-cy="form-modal"]').should('have.class', 'open');
    cy.get('[data-cy="field-name"]').type(uniqueName);
    cy.get('[data-cy="duration-15"]').click();
    cy.get('[data-cy="modality-virtual"]').click();
    cy.get('[data-cy="form-submit-btn"]').click();

    cy.get('[data-cy="form-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', uniqueName).should('be.visible');
    cy.contains('[data-cy="event-row"]', uniqueName).should('contain.text', 'Activo');

    // Act: solicitar la baja lógica y luego cancelar en el modal de confirmación
    cy.contains('[data-cy="event-row"]', uniqueName).within(() => {
      cy.get('[data-cy="btn-toggle-status"]').click();
    });

    cy.get('[data-cy="confirm-modal"]').should('have.class', 'open');
    cy.get('[data-cy="confirm-cancel-btn"]').click();

    // Assert: verificar que el modal se cierra y el tipo de evento permanece activo
    cy.get('[data-cy="confirm-modal"]').should('not.have.class', 'open');
    cy.contains('[data-cy="event-row"]', uniqueName).within(() => {
      cy.get('.badge-active').should('contain.text', 'Activo');
      cy.get('[data-cy="btn-toggle-status"]').should('have.attr', 'title', 'Dar de baja');
    });
  });
});
