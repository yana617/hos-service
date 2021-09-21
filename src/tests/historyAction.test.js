// const request = require('supertest');

// const HistoryAction = require('../models/historyAction');
const { setupDatabase } = require('./fixtures/db');
// const app = require('../../app');
// const { ERRORS } = require('../translates');

beforeEach(setupDatabase);
