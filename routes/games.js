import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allGamesData = await gamesData.getAll();
        let allGroupsData = await groupsData.getAll();
        return res.render('createGames', {title:"Games", groups: allGroupsData});
    })
    .post(async (req, res) => {
        const gameName = req.body.gameName;
        const gameDescription = req.body.gameDescription;
        const gameLocation = req.body.gameLocation;
        const maxCapacity = req.body.maxCapacity;
        const gameDate = req.body.gameDate;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const group = req.body.group;

        try {
            helpers.validateGame(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group);
            const createResult = await gamesData.create(gameName, gameDescription, gameLocation, maxCapacity, gameDate, startTime, endTime, group);

            return res.json(createResult);
        } catch (err) {
            return res.status(400).json({ error: err });
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

export default router;
