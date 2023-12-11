import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        let allGameObjs = await gamesData.getAll();
        // return res.json(allGamesData);
        return res.render("games", {games: allGameObjs});
    });

router
    .route('/:gameId')
    .get(async (req, res) => {
        try {
            let gameId = req.params.gameId;
            let gameObj = await gamesData.get(gameId);
            // return res.json(gameObj);
            return res.render("game", {
                game: gameObj,
                players: []
            });
        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

export default router;