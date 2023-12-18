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

export function formatAndValidateUser (userData, ignorePassword) {
    // Formats the data fields and checks if they are valid for user data fields. Doesn't check things like duplicate email, etc.
    let username = helpers.stringHelper(userData.username, "Username", 3, 10);
    let emailAddress = helpers.stringHelper(userData.emailAddress, "Email address", 1, null).toLowerCase();
    let password;
    if (!ignorePassword) {   //err...
        password = helpers.stringHelper(userData.password, "Password", 1, null);
        helpers.validatePassword(password);
    } else {
        password = userData.password;
    }
    let profilePicture = helpers.stringHelper(userData.profilePicture, "Profile picture", null, 2048);
    let description = helpers.stringHelper(userData.description, "Description", null, 300);
    return { username, emailAddress, password, profilePicture, description };
}


const createUser = async (username, emailAddress, password,pfp, description) => {
    if(!pfp){
        pfp = "https://www.dinosstorage.com/wp-content/uploads/2021/04/flying-disc-emoji-clipart-md.png";
    }
    if(!description){
        description = "";
    }
    let userData = {username, emailAddress, password, profilePicture:pfp, description};
    userData = formatAndValidateUser(userData, false);

    // Search for users with same username or email
    const userCollection = await users();
    const user = await userCollection.findOne({
        $or: [{ emailAddress: emailAddress }, { username: { $regex: new RegExp('^' + username + '$', 'i') } }],
    });

    if (user) {
        throw 'Username or Email address already taken';
    }

    const saltRounds = 16;
    const hashPass = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const newUser = {
        _id: new ObjectId(),
        username: userData.username,
        emailAddress: userData.emailAddress,
        description: userData.description,
        profilePicture: userData.profilePicture,
        password: hashPass,
        friends: [],
        games: [],
        groups: [],
        friendRequests: [],
    };

    // Update the user
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not add user';
    }

    return { insertedUser: true };
};

const getIDName = async (userIds) => {
    //Given an array of IDs return an array of objects, each object contains the id and the associated name
    let ret = [];
    for (let userId of userIds) {
        helpers.isValidId(userId);
        userId = userId.trim();
        const user = await getUser(userId);
        ret.push({ _id: userId, name: user.username });
    }
    return ret;
};

const editUser = async (userId, username, emailAddress, profilePicture, description) => {
    if (!userId) throw 'User Id not given';
    if (typeof userId !== 'string') throw 'User Id is not a string';
    userId = userId.trim();
    if (!ObjectId.isValid(userId)) throw 'User Id is not valid';

    let userData = {username, emailAddress, password: "", profilePicture, description};
    userData = formatAndValidateUser(userData, true);

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
        { players: userId },
        {
            $pull: {players: userId},
            $inc: {totalNumberOfPlayers: -1 }
        },
        { returnDocument: 'after' }
    );
    const updateOrganizer = await gameCollection.updateMany(
        {organizer: userId},
        { $set: { organizer: null } },
        { returnDocument: 'after' }
    );

    // Remove user from all groups
    const groupRemove = await groupCollection.updateMany(
        { players: userId },
        {
            $pull: {
                players: 
                     userId, // remove user,
            },
            $inc: { totalNumberOfPlayers: -1 },
        },
        {groupLeader: userId},
        { $set: { groupLeader: null } },
        { returnDocument: 'after' }
    );
    const updateGroupLeader = await groupCollection.updateMany(
        {groupLeader: userId},
        { $set: { groupLeader: null } },
        { returnDocument: 'after' }
    );
    const updateGroupMessages = await groupCollection.updateMany(
        {},
        { $pull: { comments: { userId: userId } } }
    );
    const updateFriendRequests = await userCollection.updateMany(
        {},
        { $pull: { friendRequests: userId } }
    );
    const updateFriendList = await userCollection.updateMany(
        {},
        { $pull: { friends: { userId: userId } } }
    );
    const userRemove = await userCollection.findOneAndDelete({ _id: new ObjectId(userId) }, { returnDocument: 'after' });
    if (!updateFriendList || !updateFriendRequests || !updateGroupMessages || !gameRemove || !updateGroupLeader || !updateOrganizer|| !groupRemove || !userRemove) throw 'Could not delete user';

    return { gameRemove, groupRemove, userRemove };
};

export const loginUser = async (emailAddress, password) => {
    //Input Validation
    if (!emailAddress || !password) throw 'Error: 1 or more fields missing';
    if (typeof emailAddress !== 'string' || typeof password !== 'string') throw 'Expected a string';
    emailAddress = emailAddress.trim().toLowerCase();
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
        friendRequests: user.friendRequests,
    };
};

const sendFriendRequest = async (userId, friendUserId) => {
    // Input Validation
    helpers.isValidId(userId);
    helpers.isValidId(friendUserId);
    userId = userId.trim();
    friendUserId = friendUserId.trim();

    if (userId === friendUserId) throw 'Cannot send friend request to yourself';

    // Check if user is already a friend or has already an existing friend request
    const user = await getUser(userId);
    const otherUser = await getUser(friendUserId);

    if (user.friends.includes(friendUserId)) throw 'User already a friend';
    if (user.friendRequests.includes(friendUserId)) throw 'You have a pending friend request from this user';
    if (otherUser.friendRequests.includes(userId)) throw 'Already sent a friend request';

    // Update other user's friend requests
    const userCollection = await users();
    const updatedInfo = await userCollection.updateOne({ _id: new ObjectId(friendUserId) }, { $push: { friendRequests: userId } });

    if (!updatedInfo) throw 'Could not update user successfully';

    return updatedInfo;
};

const acceptFriendRequest = async (userId, friendUserId) => {
    // Input Validation
    helpers.isValidId(userId);
    helpers.isValidId(friendUserId);
    userId = userId.trim();
    friendUserId = friendUserId.trim();

    // Check if there is a request to accept
    const userCollection = await users();
    const user = await getUser(userId);

    if (!user.friendRequests.includes(friendUserId)) throw 'User does not have a pending friend request from this user';

    // Update friends for both users
    const selfUpdatedInfo = await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $push: { friends: friendUserId },
            $pull: { friendRequests: friendUserId },
        }
    );
    const friendUpdatedInfo = await userCollection.updateOne({ _id: new ObjectId(friendUserId) }, { $push: { friends: userId } });

    if (!selfUpdatedInfo || !friendUpdatedInfo) throw 'Could not update user(s) successfully';

    return selfUpdatedInfo;
};

const rejectFriendRequest = async (userId, friendUserId) => {
    // Input Validation
    helpers.isValidId(userId);
    helpers.isValidId(friendUserId);
    userId = userId.trim();
    friendUserId = friendUserId.trim();

    // Check if there is a request to reject
    const userCollection = await users();
    const user = await getUser(userId);

    if (user.friendRequests.includes(friendUserId)) throw 'User does not have a pending friend request from this user';

    // Remove friend request
    const updatedInfo = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $pull: { friendRequests: friendUserId } });

    if (!updatedInfo) throw 'Could not update user successfully';

    return updatedInfo;
};

const removeFriend = async (userId, friendUserId) => {
    // Input Validation
    helpers.isValidId(userId);
    helpers.isValidId(friendUserId);
    userId = userId.trim();
    friendUserId = friendUserId.trim();

    const userCollection = await users();

    // Check if user is a friend
    const user = await getUser(userId);
    if (!user.friends.includes(friendUserId)) throw 'User is not a friend';

    // Remove friend from both users
    const selfUpdatedInfo = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $pull: { friends: friendUserId } });
    const friendUpdatedInfo = await userCollection.updateOne({ _id: new ObjectId(friendUserId) }, { $pull: { friends: userId } });

    if (!selfUpdatedInfo || !friendUpdatedInfo) throw 'Could not update user(s) successfully';

    return selfUpdatedInfo;
};
const isUserLeader = async (userId) => {
    //Returns True if user is owner of at least one game or group otherwise False
    const gameCollection = await games();
    const groupCollection = await groups();
    const gameOrganizer = await gameCollection.findOne({ organizer: userId });
    if (gameOrganizer) {
        return true; 
    }
    const groupLeader = await groupCollection.findOne({ groupLeader: userId });
    if(groupLeader){
        return true;
    }
    return false;
}
export default {
    createUser,
    getAllUsers,
    getUser,
    deleteUser,
    editUser,
    loginUser,
    findUsersThatStartWith,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getIDName,
    isUserLeader
};


