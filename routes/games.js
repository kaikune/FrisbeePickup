import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        let allGamesData = await gamesData.getAll();
        return res.json(allGamesData);
    });

router
    .route('/:gameId')
    .get(async (req, res) => {
        try {
            let gameId = req.params.gameId;
            let gameRes = await gamesData.get(gameId);
            return res.json(gameRes);
        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

export default router;