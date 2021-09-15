/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const faker = require('faker');

const Notice = require('../../models/notice');
const Claim = require('../../models/claim');

// const { AUTH_SERVICE_URL } = process.env;
// const baseUrl = `http://${AUTH_SERVICE_URL}:1081/internal`;

const generateNotice = () => ({
  _id: new mongoose.Types.ObjectId(),
  title: faker.lorem.words(3),
  description: faker.lorem.words(15),
  authorized: faker.datatype.boolean(),
});

const generateClaim = (date) => ({
  _id: new mongoose.Types.ObjectId(),
  date: date ? new Date(date) : new Date(),
  type: 'morning',
  user_id: 'c45ea315-068b-4646-9775-8d3f31219d51',
});

const setupDatabase = async () => {
  await Promise.all([Notice.deleteMany(), Claim.deleteMany()]);
};

module.exports = {
  setupDatabase,
  generateNotice,
  generateClaim,
  // baseUrl,
};
