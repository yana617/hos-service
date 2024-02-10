const axios = require('axios');
const { ERRORS } = require('../translates');

const { DOCKER_AUTH_SERVICE_URL } = process.env;
const baseUrl = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;

const request = async ({
  method, url, token, body,
}) => {
  try {
    const response = await axios({
      method,
      url: `${baseUrl}${url}`,
      data: body,
      headers: { 'x-access-token': token },
    });
    return response.data.data;
  } catch (err) {
    throw new Error(ERRORS.EXTERNAL_SERVICE_ERROR);
  }
};

const get = async ({ url, token } = {}) => request({ method: 'GET', url, token });

const post = async ({ url, body, token } = {}) => request({
  method: 'POST', body, url, token,
});

exports.checkAuth = async (token) => get({ url: '/auth', token });
exports.getUser = async (token) => get({ url: '/users/me', token });
exports.getPermissions = async (token) => get({ url: '/permissions/me', token });

exports.getUsersByIds = async (token, usersIds) => post({
  url: '/users',
  body: { ids: usersIds },
  token,
});
exports.getGuestsByIds = async (token, guestIds) => post({
  url: '/guests',
  body: { ids: guestIds },
  token,
});
exports.getOrCreateGuest = async (token, body) => post({
  url: '/guest',
  body,
  token,
});
