import { Router } from 'express';

import { usersData, gamesData, groupsData, weatherData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .post(async (req, res) => {
        const gameName = req.body.gameName;
        const gameDescription = req.body.gameDescription;
        const zip = req.body.zip;
        const state = req.body.state;
        const streetAddress = req.body.streetAddress;
        const city = req.body.city;
        const maxCapacity = req.body.maxPlayers;
        let gameDate = req.body.date;
        let startTime = req.body.startTime;
        let endTime = req.body.endTime;
        const group = req.body.group;
        let gameLocation = {zip: zip,state: state,streetAddress: streetAddress,city: city}
        try {
            let maxPlayersNumber = parseInt(maxCapacity, 10);
            startTime = helpers.convertTo12Hour(startTime)
            endTime = helpers.convertTo12Hour(endTime)
            gameDate = helpers.convertToMMDDYYYY(gameDate);
            // gamesData.validateGame(gameName, gameDescription, gameLocation, maxPlayersNumber, gameDate, startTime, endTime, group, req.session.user._id);
            const createResult = await gamesData.create(gameName, gameDescription, gameLocation, maxPlayersNumber, gameDate, startTime, endTime, group,req.session.user._id);
            res.redirect(`games/${createResult._id}`);
        } catch (err) {
            console.error(err); // Log the error
            return res.status(400).render('error', { error: err.message || 'An error occurred' });
        }
    });

router.route('/:gameId').get(async (req, res) => {
    try {
        let gameId = req.params.gameId;
        let gameObj = await gamesData.get(gameId);
        let hostGroup = null;
        if(gameObj.group !== null){
            hostGroup = await groupsData.get(gameObj.group);
        }
        let players = gameObj.players;
        // players = players.filter(player => player !== gameObj.organizer)
        let playersArr = await usersData.getIDName(players);
      
        let currentUser = req.session.user;
        let isOwner = currentUser && gameObj.organizer == currentUser._id;
        let isMember = currentUser && gameObj.players.includes(currentUser._id);
        let organizerArr = [null];
        if(gameObj.organizer !== null){
            organizerArr = await usersData.getIDName([gameObj.organizer]);
        }
        
        const weather = await weatherData.getWeather(gameObj.gameLocation.zip);

        return res.render("game", {
            title: "Game: " + gameObj.gameName,
            game: gameObj,
            players: playersArr,
            organizer: organizerArr[0],
            hostGroup: hostGroup,
            isOwner: isOwner,
            isMember: isMember,
            weather: weather
        });
    } catch (e) {
        res.status(400);
        res.json({ error: e });
    }
});

router
    .route('/edit/:gameId')
    .get(async (req, res) => {
        let gameId = req.params.gameId;
        let gameObj = await gamesData.get(gameId);
        let allGroupsData = null;
        if(req.session.user){
            let userId = req.session.user._id;
            allGroupsData = await groupsData.getAllGroupsbyUserID(userId);
        }

        return res.render("editGame", {title:"Edit Games", user:req.session.user, gameObj, states: helpers.states, groups: allGroupsData});
    })
    .post(async (req, res) => {
        try {
            let gameId = req.params.gameId;
            let currentUser = req.session.user;
            const gameObj = await gamesData.get(gameId);

            let maxPlayersNumber = parseInt(req.body.maxPlayers, 10);
            let startTime = helpers.convertTo12Hour(req.body.startTime)
            let endTime = helpers.convertTo12Hour(req.body.endTime)
            let gameDate = helpers.convertToMMDDYYYY(req.body.date);
            let gameLocation = {zip: req.body.zip, state: req.body.state,streetAddress: req.body.streetAddress,city: req.body.city}

            await gamesData.update(gameId,req.session.user._id, req.body.gameName, req.body.gameDescription, gameLocation, maxPlayersNumber, gameDate, startTime, endTime,req.body.group);
            //meId, gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, grou
            return res.redirect("/games/" + gameId);
        } catch (e) {
            console.log(e);
            res.status(400);
            return res.json({error: e});
        }
    });

router
    .route('/delete/:gameId')
    .post(async (req, res) => {
        try {
            let gameId = req.params.gameId;
            let currentUser = req.session.user;
            const gameObj = await gamesData.get(gameId);

            /*
            if (currentUser._id != gameObj.owner) {
                throw Error("not allowed");
            }
            */

            await gamesData.remove(gameId);
            //return res.json({"Deleted":true})
            return res.redirect("/");
        } catch (e) {
            console.log(e);
            res.status(400);
            return res.json({error: e});
        }
    });

router
    .route('/join/:gameId')
    .post(async (req, res) => {
        try {
            let gameId = req.params.gameId;
            let currentUser = req.session.user;

            await gamesData.addUser(currentUser._id, gameId);
            return res.redirect("/games/" + gameId);
        } catch (e) {
            console.log(e);
            res.status(400);
            return res.json({error: e});
        }
    });

router
    .route('/leave/:gameId')
    .post(async (req, res) => {
        try{
            let gameId = req.params.gameId;
            let currentUser = req.session.user;

            await gamesData.leaveGame(currentUser._id, gameId);
            return res.redirect("/games/"+gameId);
        }
        catch(e) {
            console.log(e);
            res.status(400);
            return res.json({error:e});
        }
    });

export default router;
