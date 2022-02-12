const mapUsersIntoUsersRating = (usersRating, usersInfo) => usersRating.map((user) => {
  if (usersInfo[user.id]) {
    return { ...user, fullName: `${usersInfo[user.id].name} ${usersInfo[user.id].surname}` };
  }
  return { ...user, fullName: '-' };
});

module.exports = {
  mapUsersIntoUsersRating,
};
