const userService = require('../services/userService');

// ─── Profile ──────────────────────────────────────────────────────────────────

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

// ─── Addresses ────────────────────────────────────────────────────────────────

// GET /api/users/getUserAddresses
const getUserAddresses = async (req, res) => {
    const result = await userService.getUserAddresses(req.admin.id);
    res.status(200).json({ success: true, ...result });
};

// POST /api/users/addUserAddress
const addUserAddress = async (req, res) => {
    const result = await userService.addUserAddress(req.admin.id, req.body);
    res.status(201).json({ success: true, ...result });
};

// PATCH /api/users/updateUserAddress/:addressId
const updateUserAddress = async (req, res) => {
    const result = await userService.updateUserAddress(req.admin.id, req.params.addressId, req.body);
    res.status(200).json({ success: true, ...result });
};

// DELETE /api/users/deleteUserAddress/:addressId
const deleteUserAddress = async (req, res) => {
    const result = await userService.deleteUserAddress(req.admin.id, req.params.addressId);
    res.status(200).json({ success: true, ...result });
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
};
