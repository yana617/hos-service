const mapUsersIntoUsersRating = (usersRating, usersInfo) => usersRating.map((user) => ({
  ...user,
  fullName: usersInfo[user.id]
    ? `${usersInfo[user.id].name} ${usersInfo[user.id].surname}`
    : '-',
}));

module.exports = {
  mapUsersIntoUsersRating,
};
