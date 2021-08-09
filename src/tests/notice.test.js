const request = require('supertest');

const Notice = require('../models/notice');
const {
  noticeOne,
  noticeTwo,
  setupDatabase,
} = require('./fixtures/db');
const app = require('../../app');
const { ERRORS } = require('../translates');

beforeEach(setupDatabase);

describe('GET /notices request', () => {
  test('Should return correct notices ids', async () => {
    await new Notice(noticeOne).save();
    await new Notice(noticeTwo).save();

    const response = await request(app)
      .get('/notices')
      .expect(200);

    const { data: notices } = response.body;
    expect(notices.length).toBe(2);
  });

  test('Should return empty array', async () => {
    const response = await request(app)
      .get('/notices')
      .expect(200);

    const { data: notices } = response.body;
    expect(notices.length).toBe(0);
  });
});

describe('GET /notices/:id request', () => {
  test('Should return correct notice', async () => {
    await new Notice(noticeOne).save();

    const response = await request(app)
      .get(`/notices/${noticeOne._id}`)
      .expect(200);

    const { data: notice } = response.body;
    expect(notice).toHaveProperty('title', noticeOne.title);
    expect(notice).toHaveProperty('description', noticeOne.description);
  });

  test('Should fail with not found error', async () => {
    const response = await request(app)
      .get(`/notices/${noticeOne._id}`)
      .expect(400);

    const { error } = response.body;
    expect(error).not.toBeNull();
    expect(error).toBe(ERRORS.NOTICE_NOT_FOUND);
  });
});

describe('POST /notices request', () => {
  test('Should save notice', async () => {
    const response = await request(app)
      .post('/notices')
      .send(noticeOne)
      .expect(200);

    const { data: notice } = response.body;
    expect(notice).toHaveProperty('title', noticeOne.title);
    expect(notice).toHaveProperty('description', noticeOne.description);
    const noticeInDB = await Notice.find({ title: notice.title, description: notice.description });
    expect(noticeInDB).not.toBeNull();
  });

  test('Should fail because of invalid title', async () => {
    const noticeToSave = { ...noticeOne, title: '' };
    const response = await request(app)
      .post('/notices')
      .send(noticeToSave)
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });
});

describe('PUT /notices/:id request', () => {
  test('Should edit notice correctly', async () => {
    await new Notice(noticeOne).save();

    const editedTitle = 'Edited';
    const response = await request(app)
      .put(`/notices/${noticeOne._id}`)
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
    await new Notice(noticeOne).save();

    const noticeToUpdate = { ...noticeOne, title: '' };
    const response = await request(app)
      .put(`/notices/${noticeOne._id}`)
      .send(noticeToUpdate)
      .expect(400);

    const { errors } = response.body;
    expect(errors).not.toBeNull();
  });
});

describe('DELETE /notices/:id request', () => {
  test('Should delete notice correctly', async () => {
    await new Notice(noticeOne).save();

    const response = await request(app)
      .delete(`/notices/${noticeOne._id}`)
      .expect(200);

    const { data: notice } = response.body;
    expect(notice).not.toBeNull();
    const noticeInDB = await Notice.findById(noticeOne._id);
    expect(noticeInDB).toBeNull();
  });

  test('Should fail with not found error', async () => {
    const response = await request(app)
      .delete(`/notices/${noticeOne._id}`)
      .expect(400);

    const { error } = response.body;
    expect(error).not.toBeNull();
    expect(error).toBe(ERRORS.NOTICE_NOT_FOUND);
  });
});
