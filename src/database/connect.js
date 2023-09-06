const mongoose = require('mongoose');

const {
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGODB_DATABASE,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  NODE_ENV,
} = process.env;

let url = `mongodb://${MONGODB_USERNAME}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGODB_DATABASE}?authSource=admin`;

if (NODE_ENV === 'test') {
  url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGODB_DATABASE}`;
}

mongoose.connect(url)
  .then(() => {
    if (NODE_ENV !== 'test') {
      console.log(`[*] Connected to database ${MONGODB_DATABASE}`);
    }
  })
  .catch((err) => {
    console.log(`[*] Error during connecting to database ${MONGODB_DATABASE}, error:`, err);
  });
