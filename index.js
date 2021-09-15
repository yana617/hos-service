const app = require('./app');

require('./src/database/connect');

const server = app.listen(process.env.PORT || 1082, () => {
  console.log(`[*] Server started on port ${server.address().port}`);
});
