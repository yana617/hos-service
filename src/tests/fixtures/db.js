/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const faker = require('faker');
const { v4 } = require('uuid');

const Notice = require('../../models/notice');
const Claim = require('../../models/claim');
const HistoryAction = require('../../models/historyAction');

const generateNotice = () => ({
  _id: new mongoose.Types.ObjectId(),
  title: faker.lorem.words(3),
  description: faker.lorem.words(15),
  authorized: faker.datatype.boolean(),
});

const generateHistoryAction = (action_type = 'CREATE_CLAIM') => ({
  _id: new mongoose.Types.ObjectId(),
  action_type,
});

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

const generateClaim = (date) => ({
  _id: new mongoose.Types.ObjectId(),
  date: date ? new Date(date) : new Date(),
  type: 'morning',
  user_id: v4(),
});

const setupDatabase = async () => Promise
  .all([Notice.deleteMany(), HistoryAction.deleteMany(), Claim.deleteMany()]);

module.exports = {
  setupDatabase,
  generateNotice,
  generateHistoryAction,
  generateClaim,
  generateUser,
  generateGuest,
};
