const mongoose = require('mongoose');

const Notice = require('../../models/notice');

const noticeOneId = new mongoose.Types.ObjectId();
const noticeTwoId = new mongoose.Types.ObjectId();

const noticeOne = {
  _id: noticeOneId,
  title: 'We need your help',
  description: 'We have a lot of debt on our bills, we really need help paying off the debt!',
  authorized: true,
};
const noticeTwo = {
  _id: noticeTwoId,
  title: 'We need your help, please',
  description: 'Pay the rent soon, we need to collect the entire amount in a short time.',
  authorized: false,
};

const setupDatabase = async () => {
  await Promise.all([Notice.deleteMany()]);
};

module.exports = {
  setupDatabase,
  noticeOne,
  noticeTwo,
};
