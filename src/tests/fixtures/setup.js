const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
require('../../database/connect');

afterAll(async () => {
  await mongoose.disconnect();
});
