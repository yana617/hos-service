const claimRepository = require('../repositories/ClaimRepository');
const internalService = require('../services/internal');
const { ERRORS } = require('../translates');

const getClaims = async (req, res) => {
  const { from, to } = req.query;
  const claims = await claimRepository.getWithFilters({ from, to });
  const usersIds = claims.map((claim) => claim.user_id);
  const guestIds = claims.reduce((result, claim) => {
    if (claim.guest_id) {
      result.push(claim.guest_id);
    }
    return result;
  }, []);

  const users = await internalService.getUsersByIds(req.token, usersIds);
  const guests = await internalService.getGuestsByIds(req.token, guestIds);

  const mappedUsers = {};
  users.forEach((user) => {
    mappedUsers[user.id] = user;
  });

  const mappedGuests = {};
  guests.forEach((guest) => {
    mappedGuests[guest.id] = guest;
  });

  const mappedClaims = claims.map((claim) => ({
    ...claim,
    user: mappedUsers[claim.user_id],
    guest: mappedGuests[claim.guest_id] || null,
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

  if (guest && (!guest.name || !guest.surname || !guest.phone)) {
    return res.status(400).json({ success: false, error: ERRORS.GUEST_FIELDS_ERROR });
  }

  let guestInfo = {};
  if (guest && guest.phone) {
    guestInfo = await internalService.getOrCreateGuest(req.token, {
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

  const user = await internalService.getUser(req.token);
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

  const user = await internalService.getUser(req.token);
  if (user.id !== claim.user_id) {
    return res.status(403).json({ success: false, error: ERRORS.DELETE_NOT_YOURS_CLAIM_ERROR });
  }

  await claimRepository.deleteById(claimId);
  res.status(204).send();
};

module.exports = {
  getClaims,
  createClaim,
  updateClaim,
  deleteClaim,
};
