describe('Promotions', () => {
  beforeEach(() => {
    // Reset any test state
    cy.request('GET', 'http://localhost:8000/backend/api/promotions.php')
      .then((response) => {
        response.body.forEach((promotion) => {
          cy.request('DELETE', `http://localhost:8000/backend/api/promotions.php?id=${promotion.id}`);
        });
      });
  });

  it('should display no promotions message when there are no promotions', () => {
    cy.visit('/');
    cy.contains('No hay promociones disponibles en este momento.');
  });

  it('should create a new promotion', () => {
    cy.visit('/admin');
    cy.contains('Nueva Promoción').click();

    // Fill out the form
    cy.get('#title').type('Test Promotion');
    cy.get('#description').type('Test Description');
    cy.get('#validUntil').type('2024-12-31');
    
    // Upload image
    cy.get('#image').selectFile('cypress/fixtures/test-image.jpg');

    // Submit form
    cy.contains('button', 'Publicar').click();

    // Verify promotion was created
    cy.contains('Test Promotion').should('be.visible');
    cy.contains('Test Description').should('be.visible');
  });

  it('should show validation errors', () => {
    cy.visit('/admin');
    cy.contains('Nueva Promoción').click();

    // Try to submit without filling form
    cy.contains('button', 'Publicar').click();
    cy.contains('Please fill in all fields and select an image');
  });

  it('should handle invalid image types', () => {
    cy.visit('/admin');
    cy.contains('Nueva Promoción').click();

    // Fill out form
    cy.get('#title').type('Test Promotion');
    cy.get('#description').type('Test Description');
    cy.get('#validUntil').type('2024-12-31');
    
    // Try to upload invalid file
    cy.get('#image').selectFile('cypress/fixtures/test-file.txt');

    // Submit form
    cy.contains('button', 'Publicar').click();

    // Should show error
    cy.contains('Invalid file type. Only JPG, PNG and GIF are allowed');
  });

  it('should cancel promotion creation', () => {
    cy.visit('/admin');
    cy.contains('Nueva Promoción').click();

    // Fill out form
    cy.get('#title').type('Test Promotion');
    
    // Click cancel
    cy.contains('button', 'Cancelar').click();

    // Form should be closed
    cy.get('#title').should('not.exist');
  });
}); 