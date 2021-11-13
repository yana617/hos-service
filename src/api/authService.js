const got = require('got');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}:1081/internal`;

const getOptions = (token, body = {}) => ({
  headers: { 'x-access-token': token },
  json: true,
  body,
});

exports.checkAuth = async (token) => {
  const response = await got.get(`${baseUrl}/auth`, getOptions(token));
  return response.body;
};

exports.getUser = async (token) => {
  const response = await got.get(`${baseUrl}/users/me`, getOptions(token));
  return response.body.data;
};

exports.getPermissions = async (token) => {
  const response = await got.get(`${baseUrl}/permissions/me`, getOptions(token));
  return response.body.data;
};

exports.getUsersByIds = async (token, usersIds) => {
  const response = await got.post(`${baseUrl}/users`, getOptions(token, { ids: usersIds }));
  return response.body.data;
};

exports.getGuestsByIds = async (token, guestIds) => {
  const response = await got.post(`${baseUrl}/guests`, getOptions(token, { ids: guestIds }));
  return response.body.data;
};

exports.getOrCreateGuest = async (token, body) => {
  const response = await got.post(`${baseUrl}/guest`, getOptions(token, body));
  return response.body.data;
};
