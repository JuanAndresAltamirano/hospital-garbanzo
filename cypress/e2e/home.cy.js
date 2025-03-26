describe('Home Page', () => {
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
  });

  it('should display loading state', () => {
    cy.intercept('GET', 'http://localhost:8000/backend/api/promotions.php', {
      delay: 1000,
      fixture: 'promotions.json'
    }).as('getPromotions');

    cy.visit('/');
    cy.contains('Cargando promociones...').should('be.visible');
    cy.wait('@getPromotions');
  });

  it('should display no promotions message when empty', () => {
    cy.visit('/');
    cy.contains('No hay promociones disponibles en este momento.').should('be.visible');
  });

  it('should display latest promotions', () => {
    // Create test promotions
    const promotions = [
      {
        title: 'First Promotion',
        description: 'First Description',
        validUntil: '2024-12-31'
      },
      {
        title: 'Second Promotion',
        description: 'Second Description',
        validUntil: '2024-12-31'
      },
      {
        title: 'Third Promotion',
        description: 'Third Description',
        validUntil: '2024-12-31'
      }
    ];

    // Create promotions through API
    cy.wrap(promotions).each((promotion) => {
      // Create FormData and append fields
      const formData = new FormData();
      formData.append('title', promotion.title);
      formData.append('description', promotion.description);
      formData.append('validUntil', promotion.validUntil);
      
      // Create a simple test image
      const blob = Cypress.Blob.base64StringToBlob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'image/jpeg');
      formData.append('image', blob, 'test-image.jpg');

      // Send request
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/backend/api/promotions.php',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    // Visit home page and verify promotions are displayed
    cy.visit('/');
    cy.get('.promotion-card').should('have.length', 3);
    promotions.forEach(promotion => {
      cy.contains(promotion.title).should('be.visible');
      cy.contains(promotion.description).should('be.visible');
    });
  });

  it('should display only 3 most recent promotions', () => {
    // Create 4 promotions
    const promotions = Array.from({ length: 4 }, (_, i) => ({
      title: `Promotion ${i + 1}`,
      description: `Description ${i + 1}`,
      validUntil: '2024-12-31'
    }));

    // Create promotions through API
    cy.wrap(promotions).each((promotion) => {
      const formData = new FormData();
      formData.append('title', promotion.title);
      formData.append('description', promotion.description);
      formData.append('validUntil', promotion.validUntil);
      
      // Create a simple test image
      const blob = Cypress.Blob.base64StringToBlob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'image/jpeg');
      formData.append('image', blob, 'test-image.jpg');

      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/backend/api/promotions.php',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    cy.visit('/');
    
    // Should only show 3 promotions
    cy.get('.promotion-card').should('have.length', 3);
    
    // Should not show the oldest promotion
    cy.contains('Promotion 1').should('not.exist');
    
    // Should show the 3 most recent promotions
    cy.contains('Promotion 4').should('be.visible');
    cy.contains('Promotion 3').should('be.visible');
    cy.contains('Promotion 2').should('be.visible');
  });

  it('should handle failed image loads gracefully', () => {
    // Create a promotion with an invalid image URL
    const formData = new FormData();
    formData.append('title', 'Test Promotion');
    formData.append('description', 'Test Description');
    formData.append('validUntil', '2024-12-31');
    
    // Create a simple test image
    const blob = Cypress.Blob.base64StringToBlob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'image/jpeg');
    formData.append('image', blob, 'test-image.jpg');

    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/backend/api/promotions.php',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      failOnStatusCode: false
    });

    cy.visit('/');
    
    // Verify promotion content is visible even if image fails
    cy.contains('Test Promotion').should('be.visible');
    cy.contains('Test Description').should('be.visible');
  });
}); 