const claimRepository = require('../repositories/ClaimRepository');

const getUserClaims = async (req, res) => {
  const { userId } = req.params;
  const claims = await claimRepository.getClaimsByUserId(userId);
  res.json({ success: true, data: claims });
};

module.exports = {
  getUserClaims,
};
