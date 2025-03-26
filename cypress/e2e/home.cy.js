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

    // Create uploads directory if it doesn't exist
    cy.task('fileExists', 'backend/uploads').then((exists) => {
      if (!exists) {
        cy.task('mkdir', 'backend/uploads');
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
    cy.wrap(promotions).each((promotion, index) => {
      // Create a test image with different content for each promotion
      const imageContent = `Test image content ${index + 1}`;
      const blob = new Blob([imageContent], { type: 'image/jpeg' });
      const formData = new FormData();
      
      formData.append('title', promotion.title);
      formData.append('description', promotion.description);
      formData.append('validUntil', promotion.validUntil);
      formData.append('image', blob, `test-image-${index + 1}.jpg`);

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
        cy.log(`Created promotion ${index + 1}:`, response.body);
      });
    });

    // Visit home page and verify promotions are displayed
    cy.visit('/');
    cy.get('.promotion-card', { timeout: 10000 }).should('have.length', 3);
    
    promotions.forEach(promotion => {
      cy.contains(promotion.title).should('be.visible');
      cy.contains(promotion.description).should('be.visible');
    });

    // Verify images are loaded
    cy.get('.promotion-card img').each(($img) => {
      cy.wrap($img).should(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
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
    cy.wrap(promotions).each((promotion, index) => {
      const imageContent = `Test image content ${index + 1}`;
      const blob = new Blob([imageContent], { type: 'image/jpeg' });
      const formData = new FormData();
      
      formData.append('title', promotion.title);
      formData.append('description', promotion.description);
      formData.append('validUntil', promotion.validUntil);
      formData.append('image', blob, `test-image-${index + 1}.jpg`);

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
        cy.log(`Created promotion ${index + 1}:`, response.body);
      });
    });

    cy.visit('/');
    
    // Should only show 3 promotions
    cy.get('.promotion-card', { timeout: 10000 }).should('have.length', 3);
    
    // Should not show the oldest promotion
    cy.contains('Promotion 1').should('not.exist');
    
    // Should show the 3 most recent promotions
    cy.contains('Promotion 4').should('be.visible');
    cy.contains('Promotion 3').should('be.visible');
    cy.contains('Promotion 2').should('be.visible');

    // Verify images are loaded
    cy.get('.promotion-card img').each(($img) => {
      cy.wrap($img).should(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
    });
  });

  it('should handle failed image loads gracefully', () => {
    const formData = new FormData();
    formData.append('title', 'Test Promotion');
    formData.append('description', 'Test Description');
    formData.append('validUntil', '2024-12-31');
    
    // Create an invalid image file
    const invalidImageContent = 'Invalid image content';
    const blob = new Blob([invalidImageContent], { type: 'image/jpeg' });
    formData.append('image', blob, 'invalid-image.jpg');

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

    cy.visit('/');
    
    // Verify promotion content is visible even if image fails
    cy.contains('Test Promotion').should('be.visible');
    cy.contains('Test Description').should('be.visible');
    
    // Verify placeholder is shown for failed image
    cy.get('.image-placeholder').should('be.visible');
  });
}); 