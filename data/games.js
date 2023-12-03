// This data file should export all functions using the ES6 standard as shown in the lecture code

import * as helpers from '../helpers.js';
import { games } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const create = async (gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group) => {
    // Input Validation
    helpers.validateGame(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group);

    gameName = gameName.trim();
    gameDescription = gameDescription.trim();
    gameDate = gameDate.trim();
    startTime = startTime.trim();
    endTime = endTime.trim();

    // Add game to database
    let newgame = {
        gameName,
        description: gameDescription,
        gameLocation,
        maxCapacity,
        gameDate,
        startTime,
        endTime,
        players: [],
        totalNumberOfPlayers: 0,
        group,
    };

    const gameCollection = await games();
    const insertInfo = await gameCollection.insertOne(newgame);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not add game';

    const newId = insertInfo.insertedId.toString();

    const game = await gameCollection.findOne({ _id: new ObjectId(newId) });
    game._id = game._id.toString();
    //await closeConnection(); // For testing purposes
    return game;
};

const getAll = async () => {
    const gameCollection = await games();
    let gameList = await gameCollection.find({}).project({ _id: 1, gameName: 1 }).toArray();
    if (!gameList) throw 'Could not get all games';
    gameList = gameList.map((element) => {
        element._id = element._id.toString();
        return element;
    });
    return gameList;
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
    if (!deletionInfo) {
        throw `Could not delete game with id of ${gameId}`;
    }

    const res = { gameName: deletionInfo.gameName, deleted: true };
    return res;
};

const update = async (gameId, gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group) => {
    // Input Validation
    helpers.isValidId(gameId);
    gameId = gameId.trim();

    helpers.validateGame(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group);

    gameName = gameName.trim();
    gameDescription = gameDescription.trim();
    gameDate = gameDate.trim();
    startTime = startTime.trim();
    endTime = endTime.trim();

    const oldGame = await get(gameId); // Check if game exists

    // Update record
    const updatedgame = {
        gameName,
        description: gameDescription,
        gameLocation,
        maxCapacity,
        gameDate,
        startTime,
        endTime,
        players: oldGame.players,
        totalNumberOfPlayers: oldGame.totalNumberOfPlayers,
        group,
    };

    const gameCollection = await games();
    const updatedInfo = await gameCollection.findOneAndReplace({ _id: new ObjectId(gameId) }, updatedgame, { returnDocument: 'after' });
    if (!updatedInfo) {
        throw 'could not update game successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
};

export default { create, getAll, get, remove, update };
