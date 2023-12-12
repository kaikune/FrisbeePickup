// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { users, games, groups } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const findUsersThatStartWith = async (search) => {
    //Returns the first 10 users that start with a search query
    let resultSize = 10;
    if (!search) {
        throw 'Most provide valid search term';
    }
    if (typeof search !== 'string') {
        throw 'Search term must be a valid string';
    }
    search = search.trim();
    if (search.length === 0) {
        throw 'Empty string is not valid';
    }
    const userCollection = await users();
    const reg = new RegExp(`^${search}`, 'i'); // 'i' for case-insensitive
    let userList = await userCollection.find({ username: reg }).limit(resultSize).toArray();
    if (!userList || userList.length === 0) {
        throw "Couldn't find any users with that name";
    }
    //Returns everything besides password, feel free to change
    userList = userList.map(
        (user) =>
            (user = {
                _id: user._id.toString(),
                username: user.username,
                emailAddress: user.emailAddress,
                description: user.description,
                profilePicture: user.profilePicture,
                friends: user.friends,
                games: user.games,
                groups: user.groups,
            })
    );
    return userList;
};

const createUser = async (username, emailAddress, password) => {
    // Input Validation

    helpers.validateUser(username, emailAddress, password);

    username = username.trim();
    password = password.trim();
    emailAddress = emailAddress.trim();

    // Search for users
    const userCollection = await users();
    const user = await userCollection.findOne({ emailAddress: emailAddress });

    // Check for existing email
    if (user) {
        throw 'Email address already taken';
    }
    const saltRounds = 16;
    const hashPass = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
        _id: new ObjectId(),
        username,
        emailAddress,
        description: '',
        profilePicture: null,
        password: hashPass,
        friends: [],
        games: [],
        groups: [],
    };

    // Update the user
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not add user';
    }

    return { insertedUser: true };
};
const getIDName = async (userIds)=> {
    //Given an array of IDs return an array of objects, each object contains the id and the associated name
    let ret = []
    for (let userId of userIds){
        helpers.isValidId(userId);
        userId = userId.trim();
        const user = await getUser(userId);
        ret.push({_id: userId, name: user.username})
    }
    return ret;
}
const updateUserBio = async (userId, username, profilePicture, description) => {
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';
    helpers.validateUserBio(username, profilePicture, description);
    username = username.trim();
    profilePicture = profilePicture.trim();
    description = description.trim();
    const userCollection = await users();
    await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                username: username,
                description: description,
                profilePicture: profilePicture,
            },
        }
    );
    const user = await getUser(userId);
    return user;
};
const getAllUsers = async () => {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if (!userList) throw 'Could not get all events';
    userList = userList.map((element) => {
        element._id = element._id.toString();
        return element;
    });
    return userList;
};

const getUser = async (userId) => {
    // Input Validation
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';

    // Get all users
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw 'Could not find user';
    }
    user._id = user._id.toString();
    return user;
};

const deleteUser = async (userId) => {
    // Input Validation
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';

    const gameCollection = await games();
    const groupCollection = await groups();
    const userCollection = await users();

    // Remove user from all games
    const gameRemove = await gameCollection.updateMany(
        { 'players._id': new ObjectId(userId) },
        {
            $pull: {
                players: {
                    _id: new ObjectId(userId), // remove user
                },
            },
            $inc: { totalNumberOfPlayers: -1 },
        },
        { returnDocument: 'after' }
    );

    // Remove user from all groups
    const groupRemove = await groupCollection.updateMany(
        { 'players.id': new ObjectId(userId) },
        {
            $pull: {
                players: {
                    _id: new ObjectId(userId), // remove user
                },
            },
            $inc: { totalNumberOfPlayers: -1 },
        },
        { returnDocument: 'after' }
    );
    const userRemove = await userCollection.findOneAndDelete({ _id: new ObjectId(userId) }, { returnDocument: 'after' });
    if (!gameRemove || !groupRemove || !userRemove) throw 'Could not delete user';

    return { gameRemove, groupRemove, userRemove };
};
export const loginUser = async (emailAddress, password) => {
    //Input Validation
    if (!emailAddress || !password) throw 'Error: 1 or more fields missing';
    if (typeof emailAddress !== 'string' || typeof password !== 'string') throw 'Expected a string';
    emailAddress = emailAddress.trim();
    password = password.trim();
    if (emailAddress.length === 0 || password.length === 0) throw 'Cannot be empty spaces';
    if (!helpers.isValidEmail(emailAddress)) throw 'Email is not valid';
    helpers.validatePassword(password);
    const userCollection = await users();
    const user = await userCollection.findOne({ emailAddress: emailAddress });
    if (!user) {
        throw 'Either password or email is invalid';
    }
    //Compare Passwords
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
        throw 'Either password or email is invalid';
    }
    //I dont know what we want to return for this so currently return everything besides password feel free to change
    return {
        _id: user._id.toString(),
        username: user.username,
        emailAddress: emailAddress,
        description: user.description,
        profilePicture: user.profilePicture,
        friends: user.friends,
        games: user.games,
        groups: user.groups,
    };
};

const addFriend = async (userId, friendUserId) => {
    // Input Validation
    helpers.isValidId(userId);
    helpers.isValidId(friendUserId);
    userId = userId.trim();
    friendUserId = friendUserId.trim();

    const user = await getUser(userId);
    if (user.friends.includes(friendUserId)) throw 'User already a friend';

    // Update record
    const userCollection = await users();
    const updatedInfo = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $push: { friends: friendUserId } });

    if (!updatedInfo) throw 'Could not update user successfully';
    return updatedInfo;
};

export default { createUser, getAllUsers, getUser, deleteUser, updateUserBio, loginUser, findUsersThatStartWith, addFriend,getIDName };
