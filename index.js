const app = require('./app');

require('./src/database/connect');

const server = app.listen(process.env.PORT, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});
