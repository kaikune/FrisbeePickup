import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allGamesData = await gamesData.getAll();
        let allGroupsData = await groupsData.getAll();
        if(!req.session.user){
            allGroupsData = {};
        }else{
            let userId = req.session.user._id;
            allGroupsData = await groupsData.getAllGroupsbyUserID(userId);
        }
        const states = [
            'AK',
            'AL',
            'AR',
            'AZ',
            'CA',
            'CO',
            'CT',
            'DC',
            'DE',
            'FL',
            'GA',
            'HI',
            'IA',
            'ID',
            'IL',
            'IN',
            'KS',
            'KY',
            'LA',
            'MA',
            'MD',
            'ME',
            'MI',
            'MN',
            'MO',
            'MS',
            'MT',
            'NC',
            'ND',
            'NE',
            'NH',
            'NJ',
            'NM',
            'NV',
            'NY',
            'OH',
            'OK',
            'OR',
            'PA',
            'RI',
            'SC',
            'SD',
            'TN',
            'TX',
            'UT',
            'VA',
            'VT',
            'WA',
            'WI',
            'WV',
            'WY',
        ];
        return res.render('createGames', {title:"Games", groups: allGroupsData, states: states});
    })
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
            helpers.validateGame(gameName, gameDescription, gameLocation, maxPlayersNumber, gameDate, startTime, endTime, group);
            const createResult = await gamesData.create(gameName, gameDescription, gameLocation, maxPlayersNumber, gameDate, startTime, endTime, group);
            res.redirect(`games/${createResult._id}`);
        } catch (err) {
            console.error(err); // Log the error
            return res.status(400).json({ error: err.message || 'An error occurred' });
        
        }
    });

router.route('/:gameId').get(async (req, res) => {
    try {
        let gameId = req.params.gameId;
        let gameObj = await gamesData.get(gameId);

        let hostGroup = await groupsData.get(gameObj.group);

        let playersArr = await usersData.getIDName(gameObj.players);

        let isOwner = req.session.user != null && req.session.user.games.includes(gameId);

        return res.render("game", {
            title: "Game: " + gameObj.gameName,
            game: gameObj,
            players: playersArr,
            organizer: "idk",
            hostGroup: hostGroup,
            isOwner: isOwner
        });
    } catch (e) {
        res.status(400);
        res.json({ error: e });
    }
});

router
    .route('/edit/:gameId')
    .get(async (req, res) => {
        return res.render("editGame", {title:"Edit Games", user:req.session.user});
    })
    .post(async (req, res) => {
        console.log("EDITING Games")
        return res.json({"response":"Success"})
    });

router
    .route('/delete/:gameId')
    .post(async (req, res) => {
        return res.json({"TODO":"Implement"})
    });

export default router;
