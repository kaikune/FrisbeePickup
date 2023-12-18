// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { games, users } from '../config/mongoCollections.js';
import { usersData, groupsData } from './index.js';
import { ObjectId } from 'mongodb';

export function formatAndValidateGame (gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime) {

    gameName = helpers.stringHelper(gameName, "Game name", 5, null);
    gameDescription = helpers.stringHelper(gameDescription, "Game description", 25, null);
    gameDate = helpers.stringHelper(gameDate, "Game date", 1, null);
    startTime = helpers.stringHelper(startTime, "Start time", 1, null);
    endTime = helpers.stringHelper(endTime, "End time", 1, null);

    if (!helpers.isValidDay(gameDate)) throw 'Event Date is not valid';
    if (helpers.isDateInFuture(gameDate)) throw 'Event Date has to be in the future';
    if (!helpers.isValidTime(startTime) || !helpers.isValidTime(endTime)) throw 'Start and/or end time is not valid';
    if (!helpers.compareTimes(startTime, endTime)) throw 'Start time has to be 30min before end time';

    if (maxCapacity == null || typeof maxCapacity !== 'number') throw 'Invalid max capacity!';
    if (maxCapacity <= 0) throw 'Max cap. should be > 0';
    if (maxCapacity % 1 != 0) throw 'Max cap. not a whole number';

    helpers.validateLocation(gameLocation);

    return { gameName, gameDescription, gameDate, startTime, endTime, maxCapacity, gameLocation};

}

const create = async (gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group, organizer) => {

    let gameData = formatAndValidateGame(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime);

    helpers.isValidId(group);
    helpers.isValidId(organizer);

    // Add game to database
    let newgame = {
        gameName: gameData.gameName,
        description: gameData.gameDescription,
        gameLocation: gameData.gameLocation,
        maxCapacity: gameData.maxCapacity,
        gameDate: gameData.gameDate,
        startTime: gameData.startTime,
        endTime: gameData.endTime,
        players: [organizer],
        totalNumberOfPlayers: 0,
        group,
        organizer,
        expired: false,
    };
    
    const gameCollection = await games();
    
    const insertInfo = await gameCollection.insertOne(newgame);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add game';

    const newId = insertInfo.insertedId.toString();
    
    const game = await gameCollection.findOne({ _id: new ObjectId(newId) });
    game._id = game._id.toString();
    const userCollection = await users();
    const updateUser = await userCollection.updateOne({ _id: new ObjectId(organizer) }, { $push: { games: game._id } });
    if(!updateUser){
        throw "Could not update the organzier"
    }
    //await closeConnection(); // For testing purposes
    return game;
};

const get = async (gameId) => {
    // Input Validation
    helpers.isValidId(gameId);
    gameId = gameId.trim();

    // Get game with given id
    const gameCollection = await games();
    const game = await gameCollection.findOne({ _id: new ObjectId(gameId) });
    if (game === null) throw 'No game with that id';
    game._id = game._id.toString();
    return game;
};

// Only gets all games in the future
// Set includeExpired to true to get all previous games
const getAll = async (includeExpired = false) => {
    const query = includeExpired ? {} : { expired: false };

    const gameCollection = await games();
    let gameList = await gameCollection.find(query).toArray();

    if (!gameList) throw 'Could not get all games';

    gameList = gameList.map((element) => {
        element._id = element._id.toString();
        return element;
    });
    return gameList;
};

// Get all games of given group
// Set includeExpired to false to get only future games
const getAllByGroup = async (groupId, includeExpired = true) => {
    const gameList = await getAll(includeExpired);
    let groupGames = [];

    for (const game of gameList) {
        if ((game.group === groupId)) groupGames.push(game);
    }

    return groupGames;
};

const addUser = async (userId, gameId) => {
    //Input validation
    helpers.isValidId(userId); //maybe should check if is userid and not gameid etc
    helpers.isValidId(gameId);
    userId = userId.trim();
    gameId = gameId.trim();

    const game = await get(gameId);
    if (!game) {
        throw 'Could not find game';
    }
    if (game.maxCapacity <= game.players.length) {
        throw 'Game is full';
    }
    if (game.players.includes(userId)) {
        throw 'User is already in the game.';
    }
    const user = await usersData.getUser(userId);
    if (!user) {
        throw 'Could not find user';
    }
    //Update game collection
    const gameCollection = await games();
    const userCollection = await users();
    const updateGame = await gameCollection.updateOne(
        { _id: new ObjectId(gameId) },
        {
            $push: { players: userId },
            $inc: { totalNumberOfPlayers: 1 },
        }
    );
    const updateUser = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $push: { games: gameId } });
    if (!updateUser || !updateGame) {
        throw 'Could not update user or game';
    }
    return { updateUser, updateGame };
};

const findGamesThatStartWith = async (search) => {
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
    const gameCollection = await games();
    const reg = new RegExp(`^${search}`, 'i'); // 'i' for case-insensitive
    let gameList = await gameCollection.find({ gameName: reg }).limit(resultSize).toArray();
    if (!gameList || gameList.length === 0) {
        throw "Couldn't find any games with that name";
    }
    //Returns the entire gamelist right now
    return gameList;
};

const remove = async (gameId) => {
    // Input Validation
    helpers.isValidId(gameId);
    gameId = gameId.trim();

    // Delete game with given id
    const gameCollection = await games();
    const deletionInfo = await gameCollection.findOneAndDelete(
        {
            _id: new ObjectId(gameId),
        },
        { returnDocument: 'after' }
    );
    const userCollection = await users();
    const userUpdateResult = await userCollection.updateMany(
        { games: gameId }, 
        { $pull: { games: gameId } }
    );
    
    if(!userUpdateResult){
        throw "Could not remove gameid from users";
    }
    if (!deletionInfo) {
        throw `Could not delete game with id of ${gameId}`;
    }

    const res = { gameName: deletionInfo.gameName, deleted: true };
    return res;
};

const update = async (gameId, userId, gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group) => {
    
    let gameData = formatAndValidateGame(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime);

    const oldGame = await get(gameId); // Check if game exists

    // Update record
    const updatedgame = {
        gameName: gameData.gameName,
        organizer: userId,
        description: gameData.gameDescription,
        gameLocation: gameData.gameLocation,
        maxCapacity: gameData.maxCapacity,
        gameDate: gameData.gameDate,
        startTime: gameData.startTime,
        endTime: gameData.endTime,
        players: oldGame.players,
        totalNumberOfPlayers: oldGame.totalNumberOfPlayers,
        group,
        expired: false,
    };

    const gameCollection = await games();
    const updatedInfo = await gameCollection.findOneAndReplace({ _id: new ObjectId(gameId) }, updatedgame, { returnDocument: 'after' });
    if (!updatedInfo) {
        throw 'could not update game successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
};
const getIDName = async (gameIds) => {
    //Given an array of IDs return an array of objects, each object contains the id and the associated name
    let ret = [];
    for (let gameId of gameIds) {
        helpers.isValidId(gameId);
        gameId = gameId.trim();
        const game = await get(gameId);
        ret.push({ _id: gameId, name: game.gameName });
    }
    return ret;
};

// Goes through all future games to make sure they haven't passed and updates them if they are old
const keepStatusUpdated = async () => {
    const gamesList = await getAll();
    const gameCollection = await games();

    for (let game of gamesList) {
        if (helpers.isDateInFuture(game.gameDate)) {
            try {
                await gameCollection.updateOne({ _id: new ObjectId(game._id) }, { $set: { expired: true } });
            } catch (err) {
                throw 'Unable to update status of old game';
            }
            console.log(`Expired game: ${game._id}`);
        }
    }
};
const leaveGame = async (userId, gameId) => {
    helpers.isValidId(userId);
    helpers.isValidId(gameId);
    const game = await get(gameId);
    const user = await usersData.getUser(userId);
    if(!game) throw "Could not find game";
    if(!user) throw "Could not find user";
    if(!game.players.includes(userId)) throw "User is not a part of this group";
    if(!user.games.includes(gameId)) throw "User is not a part of this group";

    const gameCollection = await games();
    const userCollection = await users();

    const updateUser = await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { games: gameId } }
    );

    const updateGame = await gameCollection.updateOne(
        { _id: new ObjectId(gameId)},
        { 
            $pull: { players: userId },
            $inc: { totalNumberOfPlayers: -1 }  
        }
    );
    if (updateUser.modifiedCount === 0 || updateGame.modifiedCount === 0) {
        throw "Could not update user or game";
    }
    return {updateUser, updateGame}; 
}

export default { create, getAll, get, getAllByGroup, remove, update, addUser, findGamesThatStartWith, keepStatusUpdated, getIDName, leaveGame };
