
describe('GW2 Dashboard App', () => {
  beforeEach(() => {
    // Mock the Electron API for browser testing
    cy.visit('/', {
      onBeforeLoad(win) {
        // @ts-ignore
        win.api = {
          settings: {
            hasApiKey: () => Promise.resolve(false),
            getApiKey: () => Promise.resolve(''),
            setApiKey: (key: string) => Promise.resolve(),
            removeApiKey: () => Promise.resolve()
          },
          notifications: {
            send: () => {},
            onNotificationClick: () => {}
          }
        };
      }
    });
  });

  it('should load the application', () => {
    cy.get('body').should('be.visible');
  });

  it('should display the setup page when no API key exists', () => {
    cy.get('body').should('contain', 'Welcome to GW2 Dashboard');
  });

  it('should display home menu when API key exists', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // @ts-ignore
        win.api = {
          settings: {
            hasApiKey: () => Promise.resolve(true),
            getApiKey: () => Promise.resolve('test-api-key'),
            setApiKey: (key: string) => Promise.resolve(),
            removeApiKey: () => Promise.resolve()
          },
          notifications: {
            send: () => {},
            onNotificationClick: () => {}
          }
        };
      }
    });
    
    cy.get('body').should('contain', 'Guild Wars 2 Dashboard');
  });
});

describe('World Boss Card', () => {
  beforeEach(() => {
    // Clear localStorage to reset card settings
    cy.clearLocalStorage();
    
    // Mock the Electron API with hasApiKey = true
    cy.visit('/', {
      onBeforeLoad(win) {
        // @ts-ignore
        win.api = {
          settings: {
            hasApiKey: () => Promise.resolve(true),
            getApiKey: () => Promise.resolve('test-api-key-12345'),
            setApiKey: (key: string) => Promise.resolve(),
            removeApiKey: () => Promise.resolve(),
            clearApiKey: () => Promise.resolve(),
            getAccountData: () => Promise.resolve({
              success: true,
              accountData: {
                id: 'test-account',
                name: 'TestPlayer.1234',
                age: 1000000,
                world: 'Test Server',
                guilds: [],
                guild_leader: '',
                created: new Date(),
                access: ['GuildWars2'],
                commander: false,
                fractal_level: 100,
                daily_ap: 5000,
                monthly_ap: 500,
                wvw_rank: 1000
              }
            }),
            getAccountName: () => Promise.resolve('TestPlayer.1234')
          },
          notifications: {
            send: () => {},
            onNotificationClick: () => {}
          },
          gw2: {
            getAllWorldBosses: () => Promise.resolve({
              success: true,
              allBosses: [
                'admiral_taidha_covington',
                'claw_of_jormag',
                'fire_elemental',
                'shadow_behemoth',
                'the_shatterer'
              ]
            }),
            getAccountWorldBosses: () => Promise.resolve({
              success: true,
              completedBosses: ['fire_elemental']
            })
          }
        };
      }
    });
  });

  it('should open settings panel', () => {
    // Click the settings button
    cy.get('.settings-icon-button').click();
    
    // Settings panel should be visible
    cy.get('.settings-panel').should('have.class', 'open');
    cy.get('.settings-panel-title').should('contain', 'Settings');
  });

  it('should enable the Daily World Bosses card', () => {
    // Open settings
    cy.get('.settings-icon-button').click();
    
    // Find and toggle the Daily World Bosses checkbox
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    
    // Close settings panel
    cy.get('.settings-panel-close').click();
    
    // World boss card should be visible
    cy.contains('.card', 'Daily World Bosses').should('be.visible');
  });

  it('should display loading state or loaded content', () => {
    // Enable the card
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Card should be visible (either loading or loaded)
    cy.contains('.card', 'Daily World Bosses').should('be.visible');
  });

  it('should display world boss list after loading', () => {
    // Enable the card
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Should display boss list elements (wait for them to appear)
    cy.get('.daily-bosses-list', { timeout: 10000 }).should('be.visible');
    cy.get('.boss-item').should('have.length.at.least', 1);
  });

  it('should display boss progress bar', () => {
    // Enable the card
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Check progress elements exist
    cy.get('.daily-progress', { timeout: 10000 }).should('be.visible');
    cy.get('.progress-bar').should('be.visible');
    cy.get('.progress-text').should('contain', 'bosses');
  });

  it('should display boss timers', () => {
    // Enable the card
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Check if at least one boss has a timer (wait for bosses to load)
    cy.get('.boss-timer', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.timer-label').first().should('contain', 'Next:');
  });

  it('should persist card visibility on reload', () => {
    // Enable the card
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Wait for card to be visible
    cy.contains('.card', 'Daily World Bosses', { timeout: 10000 }).should('be.visible');
    
    // Reload with the same mocked API
    cy.visit('/', {
      onBeforeLoad(win) {
        // @ts-ignore
        win.api = {
          settings: {
            hasApiKey: () => Promise.resolve(true),
            getApiKey: () => Promise.resolve('test-api-key-12345'),
            setApiKey: (key: string) => Promise.resolve(),
            removeApiKey: () => Promise.resolve(),
            clearApiKey: () => Promise.resolve(),
            getAccountData: () => Promise.resolve({
              success: true,
              accountData: {
                id: 'test-account',
                name: 'TestPlayer.1234',
                age: 1000000,
                world: 'Test Server',
                guilds: [],
                guild_leader: '',
                created: new Date(),
                access: ['GuildWars2'],
                commander: false,
                fractal_level: 100,
                daily_ap: 5000,
                monthly_ap: 500,
                wvw_rank: 1000
              }
            }),
            getAccountName: () => Promise.resolve('TestPlayer.1234')
          },
          notifications: {
            send: () => {},
            onNotificationClick: () => {}
          },
          gw2: {
            getAllWorldBosses: () => Promise.resolve({
              success: true,
              allBosses: [
                'admiral_taidha_covington',
                'claw_of_jormag',
                'fire_elemental',
                'shadow_behemoth',
                'the_shatterer'
              ]
            }),
            getAccountWorldBosses: () => Promise.resolve({
              success: true,
              completedBosses: ['fire_elemental']
            })
          }
        };
      }
    });
    
    // Card should still be visible after reload
    cy.contains('.card', 'Daily World Bosses', { timeout: 10000 }).should('be.visible');
  });

  it('should hide card when disabled in settings', () => {
    // Enable the card first
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Verify it's visible
    cy.contains('.card', 'Daily World Bosses').should('be.visible');
    
    // Open settings and disable it
    cy.get('.settings-icon-button').click();
    cy.contains('.settings-toggle', 'Daily World Bosses')
      .find('input[type="checkbox"]')
      .uncheck({ force: true });
    cy.get('.settings-panel-close').click();
    
    // Card should not be visible
    cy.contains('.card', 'Daily World Bosses').should('not.exist');
  });
});
