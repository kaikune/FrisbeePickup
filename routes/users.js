import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        let allUserObjs = await usersData.getAllUsers();
        // return res.json(allUsersRes);
        return res.render("users", {users: allUserObjs});
    });

router
    .route('/:userId')
    .get(async (req, res) => {
        try {
            let userId = req.params.userId;
            let userObj = await usersData.getUser(userId);

            let isOwner = (req.session.user != null) && (req.session.user._id.toString() == userId);

            // return res.json(userObj);
            return res.render("user", {
                user: userObj,
                friends: [],
                groups: [],
                games: [],
                isOwner: isOwner
            });
        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

export default router;