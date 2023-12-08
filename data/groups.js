// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { groups,users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { usersData, gamesData } from "./index.js";
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

    const userCollection = await users();
    const updateUser = await userCollection.updateOne(
        { _id: new ObjectId(groupLeader) },
        { $push: { groups: newId } }
    );
    if(!updateUser) throw "Could not update user"
   

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
const addUser = async (userId,groupId) => {
      //Input validation
      helpers.isValidId(userId);//maybe should check if is userid and not groupid etc
      helpers.isValidId(groupId);
      userId = userId.trim();
      groupId = groupId.trim();
  
      const group = await get(groupId);
      if(!group){
          throw "Could not find group"
      }
      if(group.maxCapacity <= group.players.length){
          throw "Game is full";
      }
      if(group.players.includes(userId)){
          throw "User is already in the group."
      }
      const user = await usersData.getUser(userId);
      if(!user){
          throw "Could not find user";
      }
      //Update group collection
      const groupCollection = await groups();
      const userCollection = await users();
      const updateGame = await groupCollection.updateOne(
          { _id: new ObjectId(groupId) },
          { 
              $push: { players: userId },
              $inc: { totalNumberOfPlayers: 1 } 
          }
      );
      const updateUser = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $push: { groups: groupId } }
      );
      
      if(!updateGame || !updateUser){
        throw "Could not update either game or user";
      }
      //console.log(updateUserResult)
      return {updateGame,updateUser};
}
export default { create, getAll, get, remove, update ,addUser};
