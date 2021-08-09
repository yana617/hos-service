const mongoose = require('mongoose');

const {
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
} = process.env;

const url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[*] Connected to database ${MONGO_DB}`);
    }
  })
  .catch((err) => {
    console.log(`[*] Error during connecting to database ${MONGO_DB}, error:`, err.message);
  });
