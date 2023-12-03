// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { groups } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const create = async (groupName, groupDescription, groupLeader) => {
    // Input Validation
    helpers.validateGroup(groupName, groupDescription, groupLeader);

    groupName = groupName.trim();
    groupDescription = groupDescription.trim();

    // Add group to database
    let newgroup = {
        groupName,
        description: groupDescription,
        groupLeader,
        comments: [],
        players: [],
        totalNumberOfPlayers: 0,
    };

    const groupCollection = await groups();
    const insertInfo = await groupCollection.insertOne(newgroup);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add group';

    const newId = insertInfo.insertedId.toString();

    const group = await groupCollection.findOne({ _id: new ObjectId(newId) });
    group._id = group._id.toString();
    return group;
};

const getAll = async () => {
    const groupCollection = await groups();
    let groupList = await groupCollection.find({}).project({ _id: 1, groupName: 1 }).toArray();
    if (!groupList) throw 'Could not get all groups';
    groupList = groupList.map((element) => {
        element._id = element._id.toString();
        return element;
    });
    return groupList;
};

const get = async (groupId) => {
    // Input Validation
    helpers.isValidId(groupId);
    groupId = groupId.trim();

    // Get group with given id
    const groupCollection = await groups();
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) });
    if (group === null) throw 'No group with that id';
    group._id = group._id.toString();
    return group;
};

const remove = async (groupId) => {
    // Input Validation
    helpers.isValidId(groupId);
    groupId = groupId.trim();

    // Delete group with given id
    const groupCollection = await groups();
    const deletionInfo = await groupCollection.findOneAndDelete(
        {
            _id: new ObjectId(groupId),
        },
        { returnDocument: 'after' }
    );
    if (!deletionInfo) {
        throw `Could not delete group with id of ${groupId}`;
    }

    const res = { groupName: deletionInfo.groupName, deleted: true };
    return res;
};

const update = async (groupId, groupName, groupDescription, groupLeader) => {
    // Input Validation
    helpers.isValidId(groupId);
    groupId = groupId.trim();

    helpers.validateGroup(groupName, groupDescription, groupLeader);

    groupName = groupName.trim();
    groupDescription = groupDescription.trim();

    const oldGroup = await get(groupId); // Check if group exists

    // Update record
    const updatedgroup = {
        groupName,
        description: groupDescription,
        groupLeader,
        comments: oldGroup.players,
        players: oldGroup.players,
        totalNumberOfPlayers: oldGroup.totalNumberOfPlayers,
    };

    const groupCollection = await groups();
    const updatedInfo = await groupCollection.findOneAndReplace({ _id: new ObjectId(groupId) }, updatedgroup, { returnDocument: 'after' });
    if (!updatedInfo) {
        throw 'could not update group successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
};

export default { create, getAll, get, remove, update };
