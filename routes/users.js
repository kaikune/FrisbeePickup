import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allUserObjs = await usersData.getAllUsers();
        // return res.json(allUsersRes);
        return res.render('users', { users: allUserObjs });
    });

router
    .route('/:userId')
    .get(async (req, res) => {
        try {
            let userId = req.params.userId;
            let userObj = await usersData.getUser(userId);

            let isOwner = req.session.user != null && req.session.user._id.toString() == userId;
            let friends = await usersData.getIDName(userObj.friends);
            let games = await gamesData.getIDName(userObj.games);
            let groups = await groupsData.getIDName(userObj.groups);
            const ret = {
                user: userObj,
                friends: friends,
                groups: groups,
                games: games,
                isOwner: isOwner,
            }
        
            // return res.json(userObj);
            return res.render('user', ret);
        } catch (e) {
            res.status(400);    
            res.json({ error: e });
        }
    });

router
    .route('/:userId/friends')
    .post(async (req, res) => {
        let userId = req.params.userId;
        let friendUserId = req.body.friendUserId;

        try {
            helpers.isValidId(userId);
            helpers.isValidId(friendUserId);
        } catch (e) {
            res.status(400).json({ error: e });
        }

        try {
            const userObj = await usersData.addFriend(userId, friendUserId);

            return res.json(userObj);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user successfully') return res.status(500).json({ error: e });
            else return res.status(400).json({ error: e });
        }
    });

export default router;
