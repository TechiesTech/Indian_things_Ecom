const mongoose = require('mongoose');
const User = require('../models/schemas/userSchema');

// ─── Profile ──────────────────────────────────────────────────────────────────

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

// ─── Addresses ────────────────────────────────────────────────────────────────

const currentAddresses = { $ifNull: ['$addresses', []] };
const pipelineOptions  = { new: true, updatePipeline: true };

const userExists = (id) => User.exists({ _id: id });

const findUserAddresses = (userId) =>
    User.findById(userId).select('addresses').lean();

const insertUserAddress = (userId, address, maxAddresses) => {
    const newAddress = { ...address, _id: new mongoose.Types.ObjectId() };

    const makeDefault = {
        $or: [newAddress.isDefault === true, { $eq: [{ $size: currentAddresses }, 0] }],
    };

    const addresses = {
        $let: {
            vars: { makeDefault },
            in: {
                $concatArrays: [
                    {
                        $map: {
                            input: currentAddresses,
                            as: 'item',
                            in: {
                                $mergeObjects: [
                                    '$$item',
                                    { isDefault: { $cond: ['$$makeDefault', false, '$$item.isDefault'] } },
                                ],
                            },
                        },
                    },
                    [{ $mergeObjects: [{ $literal: newAddress }, { isDefault: '$$makeDefault' }] }],
                ],
            },
        },
    };

    return User.findOneAndUpdate(
        { _id: userId, $expr: { $lt: [{ $size: currentAddresses }, maxAddresses] } },
        [{ $set: { addresses } }],
        pipelineOptions
    ).select('addresses').lean();
};

const modifyUserAddress = (userId, addressId, changes) => {
    const id = new mongoose.Types.ObjectId(addressId);

    const addresses = {
        $map: {
            input: currentAddresses,
            as: 'item',
            in: {
                $cond: [
                    { $eq: ['$$item._id', id] },
                    { $mergeObjects: ['$$item', { $literal: changes }] },
                    changes.isDefault === true
                        ? { $mergeObjects: ['$$item', { isDefault: false }] }
                        : '$$item',
                ],
            },
        },
    };

    return User.findOneAndUpdate(
        { _id: userId, 'addresses._id': id },
        [{ $set: { addresses } }],
        pipelineOptions
    ).select('addresses').lean();
};

const removeUserAddress = (userId, addressId) => {
    const id = new mongoose.Types.ObjectId(addressId);

    const hasDefault = {
        $gt: [
            { $size: { $filter: { input: '$$remaining', as: 'item', cond: { $eq: ['$$item.isDefault', true] } } } },
            0,
        ],
    };

    const addresses = {
        $let: {
            vars: {
                remaining: { $filter: { input: currentAddresses, as: 'item', cond: { $ne: ['$$item._id', id] } } },
            },
            in: {
                $cond: [
                    { $or: [{ $eq: [{ $size: '$$remaining' }, 0] }, hasDefault] },
                    '$$remaining',
                    {
                        $concatArrays: [
                            [{ $mergeObjects: [{ $arrayElemAt: ['$$remaining', 0] }, { isDefault: true }] }],
                            { $slice: ['$$remaining', 1, 3] },
                        ],
                    },
                ],
            },
        },
    };

    return User.findOneAndUpdate(
        { _id: userId, 'addresses._id': id },
        [{ $set: { addresses } }],
        pipelineOptions
    ).select('addresses').lean();
};

module.exports = {
    findUserById,
    updateUserById,
    userExists,
    findUserAddresses,
    insertUserAddress,
    modifyUserAddress,
    removeUserAddress,
};
