// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { users } from '../config/mongoCollections.js';
//import eventsFunctions from './events.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';





const createUser = async (username,emailAddress, password) => {
    // Input Validation
  
    helpers.validateUser(username, emailAddress, password);
    

    username = username.trim();
    password = password.trim();
    emailAddress = emailAddress.trim();

    // Search for users
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    // Check for existing email
    if (!userList){
        throw 'Could not get all users';
    }
    userList = userList.filter(obj => obj.emailAddress === emailAddress);
    if(userList.length > 0){
        throw "Email address already taken"
    }
    const saltRounds = 16;
    const hashPass = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
        _id: new ObjectId(),
        username,
        emailAddress,
        description: "",
        profilePicture: null,
        password: hashPass,
        friends: [],
        games: [],
        groups: []
    };

    // Update the user
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Could not add user';
    }
    return {insertedUser: true};
};
const updateUserBio = async (userId, username, profilePicture, description) =>{
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';
    helpers.validateUserBio(username,profilePicture,description);
    username = username.trim();
    profilePicture = profilePicture.trim();
    description = description.trim();
    const userCollection = await users();
    await userCollection.updateOne(
     {  _id: new ObjectId(userId) },
     { $set: {
      username : username,
      description : description,
      profilePicture : profilePicture 
    } }
    );
    const user = await getUser(userId);
    return user;
}
const getAllUsers = async () =>{
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if (!userList) throw 'Could not get all events';
    userList = userList.map((element) => {
        element._id = element._id.toString();
        return element;
    });
    return userList;
}

const getUser = async (userId) => {
    // Input Validation
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';

    // Get all users
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    const user = userList.find(user => user._id.toString() === userId);
    if(!user){
        throw "Could not find user"
    }
    user._id = user._id.toString();
    return user;
};

const deleteUser = async (userId) => {//Not implemented waiting until games and groups are finished since we will want to remove from them when deleting a user
    // Input Validation
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';

    const eventCollection = await events();

    const remove = await eventCollection.findOneAndUpdate(
        { 'users._id': new ObjectId(userId) },
        {
            $pull: {
                users: {
                    _id: new ObjectId(userId), // remove user
                },
            },
            $inc: { totalNumberOfUsers: -1 },
        },
        { returnDocument: 'after' }
    );

    if (!remove) throw 'Could not delete user';
    return remove;
};

export default { createUser, getAllUsers, getUser, deleteUser,updateUserBio };
