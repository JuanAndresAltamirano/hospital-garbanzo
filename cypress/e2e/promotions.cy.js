describe('Promotions Page', () => {
  beforeEach(() => {
    // Reset promotions before each test
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/backend/api/promotions.php',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        response.body.forEach((promotion) => {
          cy.request({
            method: 'DELETE',
            url: `http://localhost:8000/backend/api/promotions.php?id=${promotion.id}`,
            failOnStatusCode: false
          });
        });
      }
    });

    cy.visit('/promotions');
  });

  it('should display loading state', () => {
    cy.intercept('GET', 'http://localhost:8000/backend/api/promotions.php', {
      delay: 1000,
      fixture: 'promotions.json'
    }).as('getPromotions');

    cy.visit('/promotions');
    cy.contains('Cargando promociones...').should('be.visible');
    cy.wait('@getPromotions');
  });

  it('should display no promotions message when empty', () => {
    cy.contains('No hay promociones disponibles en este momento.').should('be.visible');
  });

  it('should create a new promotion successfully', () => {
    // Open create promotion form
    cy.get('[data-testid="create-promotion-button"]').click();

    // Fill in the form
    cy.get('[data-testid="promotion-title"]').type('Test Promotion');
    cy.get('[data-testid="promotion-description"]').type('Test Description');
    cy.get('[data-testid="promotion-valid-until"]').type('2024-12-31');

    // Upload test image
    cy.fixture('test-image.jpg', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
        const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
        cy.get('[data-testid="promotion-image"]').attachFile({
          fileContent: testFile,
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg'
        });
      });

    // Submit form
    cy.get('[data-testid="submit-promotion"]').click();

    // Verify success message
    cy.contains('Promoción creada exitosamente').should('be.visible');

    // Verify promotion appears in list
    cy.get('.promotion-card').should('have.length', 1);
    cy.contains('Test Promotion').should('be.visible');
    cy.contains('Test Description').should('be.visible');
    
    // Verify image loaded successfully
    cy.get('.promotion-card').first().find('img')
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });

  it('should handle validation errors', () => {
    // Open create promotion form
    cy.get('[data-testid="create-promotion-button"]').click();

    // Submit empty form
    cy.get('[data-testid="submit-promotion"]').click();

    // Verify validation messages
    cy.contains('El título es requerido').should('be.visible');
    cy.contains('La descripción es requerida').should('be.visible');
    cy.contains('La fecha de validez es requerida').should('be.visible');
    cy.contains('La imagen es requerida').should('be.visible');

    // Fill in invalid date
    cy.get('[data-testid="promotion-valid-until"]').type('invalid-date');
    cy.get('[data-testid="submit-promotion"]').click();
    cy.contains('La fecha debe estar en formato YYYY-MM-DD').should('be.visible');
  });

  it('should handle invalid file type', () => {
    // Open create promotion form
    cy.get('[data-testid="create-promotion-button"]').click();

    // Fill in form data
    cy.get('[data-testid="promotion-title"]').type('Test Promotion');
    cy.get('[data-testid="promotion-description"]').type('Test Description');
    cy.get('[data-testid="promotion-valid-until"]').type('2024-12-31');

    // Try to upload text file
    cy.fixture('test-file.txt', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
        const testFile = new File([blob], 'test-file.txt', { type: 'text/plain' });
        cy.get('[data-testid="promotion-image"]').attachFile({
          fileContent: testFile,
          fileName: 'test-file.txt',
          mimeType: 'text/plain'
        });
      });

    // Submit form
    cy.get('[data-testid="submit-promotion"]').click();

    // Verify error message
    cy.contains('Tipo de archivo inválido. Solo se permiten JPG, PNG y GIF').should('be.visible');
  });

  it('should delete a promotion', () => {
    // Create a test promotion first
    const formData = new FormData();
    formData.append('title', 'Test Promotion');
    formData.append('description', 'Test Description');
    formData.append('validUntil', '2024-12-31');

    cy.fixture('test-image.jpg', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
        formData.append('image', blob, 'test-image.jpg');
        
        return cy.request({
          method: 'POST',
          url: 'http://localhost:8000/backend/api/promotions.php',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          failOnStatusCode: false
        });
      })
      .then((response) => {
        expect(response.status).to.eq(201);
      });

    // Refresh page to see new promotion
    cy.visit('/promotions');

    // Click delete button
    cy.get('[data-testid="delete-promotion"]').first().click();

    // Confirm deletion
    cy.get('[data-testid="confirm-delete"]').click();

    // Verify success message
    cy.contains('Promoción eliminada exitosamente').should('be.visible');

    // Verify promotion is removed
    cy.contains('No hay promociones disponibles en este momento.').should('be.visible');
  });

  it('should cancel deletion', () => {
    // Create a test promotion first
    const formData = new FormData();
    formData.append('title', 'Test Promotion');
    formData.append('description', 'Test Description');
    formData.append('validUntil', '2024-12-31');

    cy.fixture('test-image.jpg', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
        formData.append('image', blob, 'test-image.jpg');
        
        return cy.request({
          method: 'POST',
          url: 'http://localhost:8000/backend/api/promotions.php',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          failOnStatusCode: false
        });
      })
      .then((response) => {
        expect(response.status).to.eq(201);
      });

    // Refresh page to see new promotion
    cy.visit('/promotions');

    // Click delete button
    cy.get('[data-testid="delete-promotion"]').first().click();

    // Cancel deletion
    cy.get('[data-testid="cancel-delete"]').click();

    // Verify promotion still exists
    cy.contains('Test Promotion').should('be.visible');
  });
}); 