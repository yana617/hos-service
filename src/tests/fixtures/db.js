/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const faker = require('faker');
const { v4 } = require('uuid');

const Notice = require('../../models/notice');
const Claim = require('../../models/claim');

const generateGuest = () => ({
  id: v4(),
  name: faker.internet.userName(),
  surname: faker.internet.userName(),
  phone: `37529${faker.datatype.number({ min: 1111111, max: 9999999 })}`,
});

const generateUser = () => ({
  ...generateGuest(),
  email: faker.internet.email(),
  birthday: new Date(),
});

const generateNotice = (internalOnly = faker.datatype.boolean()) => ({
  _id: new mongoose.Types.ObjectId(),
  title: faker.lorem.words(3),
  description: faker.lorem.words(15),
  internalOnly,
});

const generateClaim = (date) => ({
  _id: new mongoose.Types.ObjectId(),
  date: date ? new Date(date) : new Date(),
  type: 'morning',
  user_id: v4(),
});

const setupDatabase = async () => {
  await Promise.all([Notice.deleteMany(), Claim.deleteMany()]);
};

module.exports = {
  setupDatabase,
  generateNotice,
  generateClaim,
  generateUser,
  generateGuest,
};
