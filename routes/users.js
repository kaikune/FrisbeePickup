import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allUserObjs = await usersData.getAllUsers();
        return res.json(allUserObjs);
        // return res.render('user', {title:"Users", users: allUserObjs });
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
            
            let requests = await usersData.getIDName(userObj.friendRequests)

            const ret = {
                title:"User", 
                user: userObj,
                friends: friends,
                groups: groups,
                games: games,
                requests: requests,
                isOwner: isOwner,
            }
            return res.render('user', ret);
        } catch (e) {  
            res.status(400).render('error', { error: e });
        }
    });

router
    .route('/:userId/friends/sendRequest')
    .post(async (req, res) => {
        let senderId = req.session.user._id;
        let friendUserId = req.params.userId;

        try {
            helpers.isValidId(senderId);
            helpers.isValidId(friendUserId);
        } catch (e) {
            return res.status(400).render('error', { error: e });
        }

        try {
            const userObj = await usersData.sendFriendRequest(senderId, friendUserId);
            return res.redirect("/users/" + friendUserId);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user successfully') return res.status(500).render('error', { error: e });
            else return res.status(400).render('error', { error: e });
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
            return res.status(400).render('error', { error: e });
        }

        try {
            const userObj = await usersData.acceptFriendRequest(userId, friendUserId);

            return res.redirect("/users/" + userId);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user(s) successfully') return res.status(500).render('error', { error: e });
            else return res.status(400).render('error', { error: e });
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
            return res.status(400).render('error', { error: e });
        }

        try {
            const userObj = await usersData.rejectFriendRequest(userId, friendUserId);

            return res.redirect("/users/" + userId);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user successfully') return res.status(500).render('error', { error: e });
            else return res.status(400).render('error', { error: e });
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
            res.status(400).render('error', { error: e });
        }

        try {
            const userObj = await usersData.removeFriend(userId, friendUserId);

            return res.redirect("/users/" + userId);
        } catch (e) {
            // Uber bandaid
            if (e === 'Could not update user(s) successfully') return res.status(500).render('error', { error: e });
            else return res.status(400).render('error', { error: e });
        }
    });

router
    .route('/edit/:userId')
    .get(async (req, res) => {
        try{
            let userId = req.params.userId;

            if (req.session.user == null || req.session.user._id != userId) {
                return res.status(400).render('error', {error: "Not allowed"});
            }

            // user obj will just be currentUser.
            return res.render("editUser", {title:"Edit user"});
        }
        catch (err){
            console.log(err);
            return res.status(400).render('error', {error:err})
        }
    })
    .post(async (req, res) => {
        try {

            let userId = req.params.userId;
            let currentUser = req.session.user;
            if (currentUser._id !== userId) {
                throw Error("not allowed");
            }

            req.session.user = await usersData.editUser(currentUser._id, req.body.username, currentUser.emailAddress, req.body.profilePicture, req.body.description);
            return res.redirect("/users/" + currentUser._id);
        } catch (e) {
            console.log(e);
            return res.status(400).render('error', {error: e});
        }
    });

router
    .route('/delete/:userId')
    .post(async (req, res) => {
        try {

            let userId = req.params.userId;
            let currentUser = req.session.user;
            if (currentUser._id !== userId) {
                throw Error("not allowed");
            }
            await usersData.deleteUser(currentUser._id);
            return res.redirect("/logout")
        } catch (e) {
            console.log(e);
            return res.status(400).render('error', {error: e});
        }
    });

export default router;
