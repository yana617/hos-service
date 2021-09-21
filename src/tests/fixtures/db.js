/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const faker = require('faker');

const Notice = require('../../models/notice');
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

const setupDatabase = async () => {
  await Promise.all([Notice.deleteMany(), HistoryAction.deleteMany()]);
};

module.exports = {
  setupDatabase,
  generateNotice,
  generateHistoryAction,
};
