const { defineConfig } = require('cypress');
const { spawn } = require('child_process');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:run', () => {
        const electronProcess = spawn('npm', ['start'], { stdio: 'inherit' });
        process.on('exit', () => electronProcess.kill());
      });
    },
  },
});
