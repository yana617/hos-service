const authServiceApi = require('../api/authService');

const getUsersAndGuests = async (token, usersIds, guestsIds) => {
  const users = await authServiceApi.getUsersByIds(token, usersIds);
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
