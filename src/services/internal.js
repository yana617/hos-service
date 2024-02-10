const authServiceApi = require('../api/authService');
const { ERRORS } = require('../translates');

const getUsersAndGuests = async (token, usersIds, guestsIds) => {
  const users = await authServiceApi.getUsersByIds(token, usersIds);
  if (new Set(usersIds).size !== users.length) {
    throw new Error(ERRORS.EXTERNAL_SERVICE_ERROR);
  }

  let guests = [];
  if (guestsIds && guestsIds.length > 0) {
    guests = await authServiceApi.getGuestsByIds(token, guestsIds);
  }

  const mappedUsers = {};
  users.forEach((user) => {
    mappedUsers[user.id] = user;
  });

  const mappedGuests = {};
  guests.forEach((guest) => {
    mappedGuests[guest.id] = guest;
  });

  return { users: mappedUsers, guests: mappedGuests };
};

module.exports = {
  getUsersAndGuests,
};
