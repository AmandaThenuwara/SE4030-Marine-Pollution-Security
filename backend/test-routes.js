const app = require('./server');

console.log('\n=== Registered Routes ===\n');

function printRoutes(stack, prefix = '') {
  stack.forEach((middleware) => {
    if (middleware.route) {
      // Route middleware
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${prefix}${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      const routerPath = middleware.regexp.source
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '')
        .replace(/\\\//g, '/');
      printRoutes(middleware.handle.stack, prefix + routerPath);
    }
  });
}

printRoutes(app._router.stack);
