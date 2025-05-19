// Wrapper script with error handling and auto-restart capability
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const MAX_RESTARTS = 5;
const RESTART_DELAY = 10000; // 10 seconds
let restartCount = 0;

function startBot() {
  console.log(`Starting CS News Bot (Attempt ${restartCount + 1}/${MAX_RESTARTS})`);
  
  // Start the bot process
  const botProcess = spawn('node', [path.join(__dirname, 'index.js')], {
    stdio: 'inherit'
  });
  
  // Handle process events
  botProcess.on('close', (code) => {
    console.log(`Bot process exited with code ${code}`);
    
    if (restartCount < MAX_RESTARTS) {
      console.log(`Restarting in ${RESTART_DELAY / 1000} seconds...`);
      restartCount++;
      
      setTimeout(() => {
        startBot();
      }, RESTART_DELAY);
    } else {
      console.error(`Maximum restart attempts (${MAX_RESTARTS}) reached. Exiting.`);
      process.exit(1);
    }
  });
  
  // Handle uncaught exceptions in this wrapper script
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception in wrapper script:', error);
  });
}

// Start the bot for the first time
startBot();
