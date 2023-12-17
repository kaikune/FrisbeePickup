import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allUserObjs = await usersData.getAllUsers();
        // return res.json(allUsersRes);
        return res.render('users', {title:"Users", users: allUserObjs });
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
                title:"User", 
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
    .route('/:userId/friends/sendRequest')
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
            const userObj = await usersData.sendFriendRequest(userId, friendUserId);

            return res.json(userObj);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user successfully') return res.status(500).json({ error: e });
            else return res.status(400).json({ error: e });
        }
    });

router
    .route('/:userId/friends/acceptRequest')
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
            const userObj = await usersData.acceptFriendRequest(userId, friendUserId);

            return res.json(userObj);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user(s) successfully') return res.status(500).json({ error: e });
            else return res.status(400).json({ error: e });
        }
    });

router
    .route('/:userId/friends/rejectRequest')
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
            const userObj = await usersData.rejectFriendRequest(userId, friendUserId);

            return res.json(userObj);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user successfully') return res.status(500).json({ error: e });
            else return res.status(400).json({ error: e });
        }
    });

router
    .route('/:userId/friends/removeFriend')
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
            const userObj = await usersData.removeFriend(userId, friendUserId);

            return res.json(userObj);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user(s) successfully') return res.status(500).json({ error: e });
            else return res.status(400).json({ error: e });
        }
    });

router
    .route('/edit/:userId')
    .get(async (req, res) => {
        let userId = req.params.userId;
        let userObj = await usersData.getUser(userId);

        return res.render("editUser", {title:"Edit User", user:req.session.user, userObj: userObj});
    })
    .post(async (req, res) => {
        console.log("EDITING USER")
        return res.json({"TODO":"Implement"})
    });

router
    .route('/delete/:gameId')
    .post(async (req, res) => {
        return res.json({"TODO":"Implement"})
    });

export default router;
