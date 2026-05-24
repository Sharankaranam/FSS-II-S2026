const fs = require('fs');
global.window = {};

// Mock DOM
global.document = {
  getElementById: (id) => ({ classList: { add: ()=>{}, remove: ()=>{} }, style: {}, addEventListener: ()=>{} }),
  addEventListener: (event, cb) => {
    if (event === 'DOMContentLoaded') {
      setTimeout(cb, 100);
    }
  }
};
global.location = { hash: '' };

try {
  eval(fs.readFileSync('data.js', 'utf8'));
  console.log("data.js loaded");
  eval(fs.readFileSync('fuzzy.js', 'utf8'));
  console.log("fuzzy.js loaded");
  eval(fs.readFileSync('app.js', 'utf8'));
  console.log("app.js loaded");
  
  // Try to call router if available
  if (typeof router === 'function') {
    router();
    console.log("router executed");
  }
} catch (e) {
  console.error("Simulation error:", e);
}
