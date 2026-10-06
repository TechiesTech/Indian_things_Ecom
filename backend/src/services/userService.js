const userRepository = require('../repositories/userRepository');

const fail = (status, message) => Object.assign(new Error(message), { status });

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

module.exports = { getUserProfile, updateUserProfile };
