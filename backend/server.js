const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
=====================================================
  Teryak Medical Platform - Backend Server
  Server running at: http://localhost:${PORT}
  API Health Check:  http://localhost:${PORT}/api/health
  Frontend Home:     http://localhost:${PORT}/index.html
=====================================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});
