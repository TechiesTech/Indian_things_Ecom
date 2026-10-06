const User = require('../models/schemas/userSchema');

// Fields that must be set with dot notation to avoid overwriting the full preferences object
const toSetFields = ({ preferences, ...fields }) => {
    Object.entries(preferences || {}).forEach(([key, value]) => {
        fields[`preferences.${key}`] = value;
    });
    return fields;
};

const findUserById = (id) =>
    User.findById(id).lean();

const updateUserById = (id, data) =>
    User.findByIdAndUpdate(
        id,
        { $set: toSetFields(data) },
        { new: true }
    ).lean();

module.exports = { findUserById, updateUserById };
