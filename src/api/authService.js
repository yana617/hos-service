const axios = require('axios');
const { ERRORS } = require('../translates');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

const getOptions = (token) => ({
  headers: { 'x-access-token': token },
});

const get = async (url, options) => {
  try {
    const response = await axios.get(url, options);
    return response.data.data;
  } catch (err) {
    throw new Error(ERRORS.EXTERNAL_SERVICE_ERROR);
  }
};

const post = async (url, body, options) => {
  try {
    const response = await axios.post(url, body, options);
    return response.data.data;
  } catch (err) {
    throw new Error(ERRORS.EXTERNAL_SERVICE_ERROR);
  }
};

exports.checkAuth = async (token) => get(`${baseUrl}/auth`, getOptions(token));
exports.getUser = async (token) => get(`${baseUrl}/users/me`, getOptions(token));
exports.getPermissions = async (token) => get(`${baseUrl}/permissions/me`, getOptions(token));

exports.getUsersByIds = async (token, usersIds) => post(`${baseUrl}/users`, { ids: usersIds }, getOptions(token));
exports.getGuestsByIds = async (token, guestIds) => post(`${baseUrl}/guests`, { ids: guestIds }, getOptions(token));
exports.getOrCreateGuest = async (token, body) => post(`${baseUrl}/guest`, body, getOptions(token));
