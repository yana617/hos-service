const mapUsersIntoClaimsRating = (claimsRating, usersInfo) => claimsRating.map((user) => {
  if (usersInfo[user.id]) {
    return { ...user, fullName: `${usersInfo[user.id].name} ${usersInfo[user.id].surname}` };
  }
  return { ...user, fullName: '-' };
});

module.exports = {
  mapUsersIntoClaimsRating,
};
