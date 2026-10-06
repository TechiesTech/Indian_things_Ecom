const userService = require('../services/userService');

// GET /api/users/getUserProfile
const getUserProfile = async (req, res) => {
    const result = await userService.getUserProfile(req.admin.id);
    res.status(200).json({ success: true, ...result });
};

// PATCH /api/users/updateUserProfile
const updateUserProfile = async (req, res) => {
    const result = await userService.updateUserProfile(req.admin.id, req.body);
    res.status(200).json({ success: true, ...result });
};

module.exports = { getUserProfile, updateUserProfile };
