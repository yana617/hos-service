const claimRepository = require('../repositories/ClaimRepository');
const authServiceApi = require('../api/authService');
const { ERRORS } = require('../translates');
const historyActionsService = require('../services/historyAction');
const internalService = require('../services/internal');
const claimsService = require('../services/claim');

const getClaims = async (req, res) => {
  const { from, to } = req.query;
  const claims = await claimRepository.getWithFilters({ from, to });
  const usersIds = claims.map((claim) => claim.user_id);
  const guestsIds = claims.reduce((result, claim) => {
    if (claim.guest_id) {
      result.push(claim.guest_id);
    }
    return result;
  }, []);
  const { users, guests } = await internalService.getUsersAndGuests(req.token, usersIds, guestsIds);

  const mappedClaims = claims.map((claim) => ({
    ...claim,
    user: users[claim.user_id],
    guest: guests[claim.guest_id] || null,
  }));
  res.json({ success: true, data: mappedClaims });
};

const createClaim = async (req, res) => {
  const {
    date,
    type,
    additional_people,
    questionable,
    comment,
    arrival_time,
    user_id,
    guest,
  } = req.body;

  let guestInfo = {};
  if (guest && guest.phone) {
    guestInfo = await authServiceApi.getOrCreateGuest(req.token, {
      name: guest.name,
      surname: guest.surname,
      phone: guest.phone,
    });
  }

  const claim = await claimRepository.create({
    date,
    type,
    additional_people,
    questionable,
    comment,
    arrival_time,
    user_id,
    guest_id: guestInfo.id || null,
  });

  historyActionsService.onClaimAction({
    actionType: claim.guest_id ? 'ADMIN_CREATE_GUEST_CLAIM' : 'CREATE_CLAIM',
    guestId: guestInfo.id,
    userFromId: user_id,
    date,
    type,
    token: req.token,
  });

  res.json({ success: true, data: claim });
};

const updateClaim = async (req, res) => {
  const {
    additional_people,
    questionable,
    comment,
    arrival_time,
  } = req.body;

  const { id: claimId } = req.params;
  const claim = await claimRepository.getById(claimId);
  if (!claim) {
    return res.status(404).json({ success: false, error: ERRORS.CLAIM_NOT_FOUND });
  }

  const user = await authServiceApi.getUser(req.token);
  if (user.id !== claim.user_id) {
    return res.status(403).json({ success: false, error: ERRORS.UPDATE_NOT_YOURS_CLAIM_ERROR });
  }

  const updatedClaim = await claimRepository.update(claimId, {
    additional_people,
    questionable,
    comment,
    arrival_time,
  });
  res.json({ success: true, data: updatedClaim });
};

const deleteClaim = async (req, res) => {
  const { id: claimId } = req.params;
  const claim = await claimRepository.getById(claimId);
  if (!claim) {
    return res.status(404).json({ success: false, error: ERRORS.CLAIM_NOT_FOUND });
  }

  const user = await authServiceApi.getUser(req.token);
  if (user.role !== 'ADMIN' && user.id !== claim.user_id) {
    return res.status(403).json({ success: false, error: ERRORS.DELETE_NOT_YOURS_CLAIM_ERROR });
  }

  await claimRepository.deleteById(claimId);

  let historyActionType = 'DELETE_CLAIM';
  if (claim.guest_id) {
    historyActionType = 'ADMIN_DELETE_GUEST_CLAIM';
  } else if (user.id !== claim.user_id) {
    historyActionType = 'ADMIN_DELETE_VOLUNTEER_CLAIM';
  }

  historyActionsService.onClaimAction({
    actionType: historyActionType,
    guestId: claim.guest_id,
    userFromId: user.id,
    ...(user.id !== claim.user_id ? { userToId: claim.user_id } : {}),
    date: claim.date,
    type: claim.type,
    token: req.token,
  });

  res.status(204).send();
};

const getClaimsRating = async (req, res) => {
  let allTimeUsersRating = await claimRepository.getUsersRatingFromClaimsFromDateToToday();

  const usersIds = allTimeUsersRating.map((user) => user.id);
  const { users } = await internalService.getUsersAndGuests(req.token, usersIds, []);

  allTimeUsersRating = claimsService.mapUsersIntoUsersRating(allTimeUsersRating, users);

  let today = new Date();
  const yearAgoDate = new Date(today.setFullYear(today.getFullYear() - 1));
  let yearUsersRating = await claimRepository
    .getUsersRatingFromClaimsFromDateToToday(yearAgoDate);
  yearUsersRating = claimsService.mapUsersIntoUsersRating(yearUsersRating, users);

  today = new Date();
  const monthAgoDate = new Date(today.setMonth(today.getMonth() - 1));
  let monthUsersRating = await claimRepository
    .getUsersRatingFromClaimsFromDateToToday(monthAgoDate);
  monthUsersRating = claimsService.mapUsersIntoUsersRating(monthUsersRating, users);

  res.json({
    success: true,
    data: {
      allTime: allTimeUsersRating,
      year: yearUsersRating,
      month: monthUsersRating,
    },
  });
};

module.exports = {
  getClaims,
  createClaim,
  updateClaim,
  deleteClaim,
  getClaimsRating,
};
