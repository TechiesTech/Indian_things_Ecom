const userRepository = require('../repositories/userRepository');

const MAX_ADDRESSES = 3;

const fail = (status, message) => Object.assign(new Error(message), { status });

// ─── Profile ──────────────────────────────────────────────────────────────────

const getUserProfile = async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw fail(404, 'User not found.');
    return { user };
};

const updateUserProfile = async (userId, data) => {
    const user = await userRepository.updateUserById(userId, data);
    if (!user) throw fail(404, 'User not found.');
    return { message: 'Profile updated successfully.', user };
};

// ─── Addresses ────────────────────────────────────────────────────────────────

const getUserAddresses = async (userId) => {
    const user = await userRepository.findUserAddresses(userId);
    if (!user) throw fail(404, 'User not found.');
    return { addresses: user.addresses };
};

const addUserAddress = async (userId, address) => {
    const user = await userRepository.insertUserAddress(userId, address, MAX_ADDRESSES);
    if (user) return { message: 'Address added successfully.', addresses: user.addresses };

    // null means either user not found OR max limit reached — check which
    const exists = await userRepository.userExists(userId);
    if (!exists) throw fail(404, 'User not found.');
    throw fail(400, `You can save only ${MAX_ADDRESSES} addresses. Delete an unused address to add a new one.`);
};

const updateUserAddress = async (userId, addressId, changes) => {
    const user = await userRepository.modifyUserAddress(userId, addressId, changes);
    if (!user) throw fail(404, 'Address not found.');
    return { message: 'Address updated successfully.', addresses: user.addresses };
};

const deleteUserAddress = async (userId, addressId) => {
    const user = await userRepository.removeUserAddress(userId, addressId);
    if (!user) throw fail(404, 'Address not found.');
    return { message: 'Address deleted successfully.', addresses: user.addresses };
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
};
