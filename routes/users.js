import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        let allUsersRes = await usersData.getAllUsers();
        return res.json(allUsersRes);
    });

router
    .route('/:userId')
    .get(async (req, res) => {
        try {
            let userId = req.params.userId;
            let userRes = await usersData.getUser(userId);
            return res.json(userRes);
        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

export default router;