describe('AgendaYA - M04 Booking Público', () => {
  beforeEach(() => {
    // URL local del frontend
    cy.visit('ics/booking.html');
  });

  it('(SAD) Intento de confirmación de reserva sin completar los campos obligatorios PASO 3 DE BOOKING', () => {
    // Arrange: preparar el estado inicial
    cy.get('[data-cy="event-type-card"]').first().click();
    cy.get('[data-cy="calendar-day"]:not(.disabled):not(.empty)').first().click();
    cy.get('[data-cy="btn-next"]').should('not.be.disabled').click();
    cy.get('#step-2').should('have.class', 'active');
    cy.get('[data-cy="time-slot"]:not([disabled])').first().click();
    cy.get('[data-cy="btn-next"]').click();
    cy.get('#step-3').should('have.class', 'active');
    cy.get('[data-cy="guest-fullname"]').clear();
    cy.get('[data-cy="guest-email"]').clear();

    // Act: ejecutar la acción principal
    cy.get('[data-cy="btn-next"]').click();

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="confirm-modal"]').should('have.class', 'open');
    cy.get('[data-cy="confirm-title"]').should('contain.text', 'Campo obligatorio requerido');
    cy.get('[data-cy="confirm-message"]').should('contain.text', 'Nombre completo');
    cy.get('#confirm-action-btn').click();
    cy.get('[data-cy="guest-fullname"]').should('have.class', 'error');
    cy.get('[data-cy="guest-fullname-error"]').should('be.visible');
  });

  it('(HP) Reserva exitosa', () => {
    // Arrange: preparar el estado inicial
    const guestName = 'Juan Carlos Pérez';
    const guestEmail = 'juan.perez@example.com';
    const guestPhone = '+54 11 4455-6677';

    cy.get('[data-cy="event-type-card"]').first().click();
    cy.get('[data-cy="calendar-day"]:not(.disabled):not(.empty)').first().click();
    cy.get('[data-cy="btn-next"]').click();
    cy.get('#step-2').should('have.class', 'active');
    cy.get('[data-cy="time-slot"]:not([disabled])').first().click();
    cy.get('[data-cy="btn-next"]').click();
    cy.get('#step-3').should('have.class', 'active');
    cy.get('[data-cy="guest-fullname"]').type(guestName);
    cy.get('[data-cy="guest-email"]').type(guestEmail);
    cy.get('[data-cy="guest-phone"]').type(guestPhone);
    cy.get('[data-cy="btn-next"]').click();
    cy.get('#step-4').should('have.class', 'active');
    cy.get('#confirm-name').should('contain.text', guestName);
    cy.get('#confirm-email').should('contain.text', guestEmail);

    // Act: ejecutar la acción principal
    cy.get('[data-cy="btn-next"]').click();

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="success-screen"]', { timeout: 8000 })
      .should('have.class', 'active');
    cy.get('[data-cy="success-screen"]')
      .should('contain.text', '¡Turno confirmado!');
    cy.get('[data-cy="booking-ref-code"]')
      .should('be.visible')
      .and('contain.text', 'Ref:');
  });
});
