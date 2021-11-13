const request = require('supertest');
const nock = require('nock');

const Notice = require('../models/notice');
const { generateNotice, setupDatabase } = require('./fixtures/db');
const app = require('../../app');
const { ERRORS } = require('../translates');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}:1081/internal`;

beforeEach(async () => {
  await setupDatabase();
  nock.cleanAll();
});

describe('GET /notices request', () => {
  test('Should return correct notices ids', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    await new Notice(generateNotice()).save();
    await new Notice(generateNotice()).save();

    const response = await request(app)
      .get('/notices')
      .expect(200);

    const { data: notices } = response.body;
    expect(notices.length).toBe(2);
  });

  test('Should return empty array', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    const response = await request(app)
      .get('/notices')
      .expect(200);

    const { data: notices } = response.body;
    expect(notices.length).toBe(0);
  });

  test('Should return correct notices', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_CLAIM'] });
    await new Notice(generateNotice(false)).save();
    await new Notice(generateNotice(true)).save();

    const response = await request(app)
      .get('/notices')
      .expect(200);

    const { data: notices } = response.body;
    expect(notices.length).toBe(2);
  });

  test('Should return correct notices without permissions', async () => {
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: [] });
    await new Notice(generateNotice(false)).save();
    await new Notice(generateNotice(true)).save();

    const response = await request(app)
      .get('/notices')
      .expect(200);

    const { data: notices } = response.body;
    expect(notices.length).toBe(1);
  });
});

describe('GET /notices/:id request', () => {
  test('Should return correct notice', async () => {
    const noticeOne = generateNotice();
    await new Notice(noticeOne).save();

    const response = await request(app)
      .get(`/notices/${noticeOne._id}`)
      .expect(200);

    const { data: notice } = response.body;
    expect(notice).toHaveProperty('title', noticeOne.title);
    expect(notice).toHaveProperty('description', noticeOne.description);
  });

  test('Should fail with not found error', async () => {
    const noticeOne = generateNotice();
    const response = await request(app)
      .get(`/notices/${noticeOne._id}`)
      .expect(404);

    const { error } = response.body;
    expect(error).not.toBeNull();
    expect(error).toBe(ERRORS.NOTICE_NOT_FOUND);
  });
});

describe('POST /notices request', () => {
  test('Should save notice', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_NOTICE'] });
    const noticeOne = generateNotice();
    const response = await request(app)
      .post('/notices')
      .set('x-access-token', 'valid token')
      .send(noticeOne)
      .expect(200);

    const { data: notice } = response.body;
    expect(notice).toHaveProperty('title', noticeOne.title);
    expect(notice).toHaveProperty('description', noticeOne.description);
    const noticeInDB = await Notice.find({ title: notice.title, description: notice.description });
    expect(noticeInDB).not.toBeNull();
  });

  test('Should fail because of invalid title', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['CREATE_NOTICE'] });
    const noticeToSave = { ...generateNotice(), title: '' };
    const response = await request(app)
      .post('/notices')
      .set('x-access-token', 'valid token')
      .send(noticeToSave)
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });
});

describe('PUT /notices/:id request', () => {
  test('Should edit notice correctly', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['EDIT_NOTICE'] });
    const noticeOne = generateNotice();
    await new Notice(noticeOne).save();

    const editedTitle = 'Edited';
    const response = await request(app)
      .put(`/notices/${noticeOne._id}`)
      .set('x-access-token', 'valid token')
      .send({ ...noticeOne, title: editedTitle })
      .expect(200);

    const { data: notice } = response.body;
    expect(notice).toHaveProperty('title', editedTitle);
    expect(notice).toHaveProperty('description', noticeOne.description);
    const noticeInDB = await Notice.findById(noticeOne._id);
    expect(noticeInDB).not.toBeNull();
    expect(noticeInDB).toHaveProperty('title', editedTitle);
  });

  test('Should fail because of invalid title', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['EDIT_NOTICE'] });
    const noticeOne = generateNotice();
    await new Notice(noticeOne).save();

    const noticeToUpdate = { ...noticeOne, title: '' };
    const response = await request(app)
      .put(`/notices/${noticeOne._id}`)
      .set('x-access-token', 'valid token')
      .send(noticeToUpdate)
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });

  test('Should fail with not found error', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['EDIT_NOTICE'] });
    const noticeOne = generateNotice();
    const response = await request(app)
      .put(`/notices/${noticeOne._id}`)
      .set('x-access-token', 'valid token')
      .send(noticeOne)
      .expect(404);

    const { error } = response.body;
    expect(error).not.toBeNull();
    expect(error).toBe(ERRORS.NOTICE_NOT_FOUND);
  });
});

describe('DELETE /notices/:id request', () => {
  test('Should delete notice correctly', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['DELETE_NOTICE'] });
    const noticeOne = generateNotice();
    await new Notice(noticeOne).save();

    await request(app)
      .delete(`/notices/${noticeOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(204);

    const noticeInDB = await Notice.findById(noticeOne._id);
    expect(noticeInDB).toBeNull();
  });

  test('Should fail with not found error', async () => {
    nock(baseUrl).get('/auth').reply(200, { success: true });
    nock(baseUrl).get('/permissions/me').reply(200, { success: true, data: ['DELETE_NOTICE'] });
    const noticeOne = generateNotice();
    const response = await request(app)
      .delete(`/notices/${noticeOne._id}`)
      .set('x-access-token', 'valid token')
      .expect(404);

    const { error } = response.body;
    expect(error).not.toBeNull();
    expect(error).toBe(ERRORS.NOTICE_NOT_FOUND);
  });
});
