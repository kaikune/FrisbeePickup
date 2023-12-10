import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        let allGroupsData = await groupsData.getAll();

        return res.json(allGroupsData);
    });

router
    .route('/:groupId')
    .get(async (req, res) => {
        try {
            let groupId = req.params.groupId;
            let groupRes = await groupsData.get(groupId);

            return res.json(groupRes);
        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

router
    .route('/:groupId/comments')
    .post(async (req, res) => {
        try {
            let groupId = req.params.groupId;
            let comment = req.body.comment;
            let userId = req.body.userId;

            let groupRes = await groupsData.addComment(groupId, userId, comment)
            return res.json(groupRes);
        } catch (e) {
            if (e === 'Could not update group successfully') return res.status(500).json({error: e})
            return res.status(400).json({error: e})
        }
    })
export default router;