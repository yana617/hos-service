const claimRepository = require('../repositories/ClaimRepository');

const getUserClaims = async (req, res) => {
  try {
    const { userId } = req.params;
    const claims = await claimRepository.getClaimsByUserId(userId);
    res.json({ success: true, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getUserClaims,
};
