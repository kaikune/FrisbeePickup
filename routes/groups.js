import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';
import groups from '../data/groups.js';
const router = Router();

router
    .route('/')
    .post(async (req, res) => {
        const groupName = req.body.groupName;
        const groupDescription = req.body.groupDescription;
        
        if(!req.session.user) return res.status(400).render('error', { error: "Must be logged in" });
        const groupLeader = req.session.user._id;
        try {
            helpers.validateGroup(groupName, groupDescription, groupLeader)
            const createResult = await groupsData.create(groupName, groupDescription, groupLeader);     
            res.redirect(`groups/${createResult._id}`);
        } catch (err) {
            return res.status(400).render('error', { title: 'Error', error: err });
        }
    });

router.route('/:groupId').get(async (req, res) => {
    try {
        let groupId = req.params.groupId;
        helpers.isValidId(groupId);
        const groupObj = await groupsData.get(groupId);
        let players=  groupObj.players;
        players = players.filter(player => player !== groupObj.groupLeader)
        const members = await usersData.getIDName(players);
        let games = await gamesData.getAllByGroup(groupId);
        games = games.map(game => ({_id: game._id, name: game.gameName}));
        let owner = null;
        if(groupObj.groupLeader !== null){
            owner = await usersData.getUser(groupObj.groupLeader);
        }
        let currentUser = req.session.user;
        let isMember = currentUser && groupObj.players.includes(currentUser._id);
        let isOwner = currentUser && owner._id == currentUser._id;

        groupObj.comments.forEach(async comment => {
            try{
                comment.sender = (await usersData.getIDName([comment.userId]))[0]
                if (req.session.user._id === comment.userId) {
                    comment.isSender = true;
                }
            }
            catch{
                comment.sender = null;
            }
        });
        
        return res.render('group', {
            title:"Group: " + groupObj.groupName,
            group: groupObj,
            members: members,
            games: games,
            owner: owner,
            isMember: isMember,
            isOwner: isOwner
        });
    } catch (e) {
        return res.status(400).render('error', { title: 'Error', error: e });
    }
});

router.route('/:groupId/comments').post(async (req, res) => {
    try {
        let groupId = req.params.groupId;
        let comment = req.body.comment;
        let userId = req.session.user._id

        helpers.isValidId(groupId);
        helpers.isValidId(userId);
        helpers.stringHelper(comment, "Comment", 1, 1000);

        let groupRes = await groupsData.addComment(groupId, userId, comment);
        return res.redirect("/groups/" + groupId);
    } catch (e) {
        if (e === 'Could not update group successfully') return res.status(500).render('error', { error: e });
        return res.status(400).render('error', { title: 'Error', error: e });
    }
});

router.route('/:groupId/comments/delete').post(async (req, res) => {
    try{
        let groupId = req.params.groupId;
        let commentId = req.body.commentId;

        helpers.isValidId(groupId);
        helpers.isValidId(commentId);

        await groupsData.removeComment(groupId, commentId);
        return res.redirect('/groups/' + groupId);
    }
    catch (err) {
        return res.status(400).render('error', { title: 'Error', error: err })
    }
})

router
    .route('/edit/:groupId')
    .get(async (req, res) => {
        try {
            let groupId = req.params.groupId;

            helpers.isValidId(groupId);
            const groupObj = await groupsData.get(groupId);

            return res.render("editGroup", {title:"Edit group", groupObj});
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    })
    .post(async (req, res) => {
        try {
            let groupId = req.params.groupId;
            let currentUser = req.session.user;

            helpers.isValidId(groupId);
            let groupObj = await groupsData.get(groupId);


            if (currentUser._id !== groupObj.groupLeader) {
                throw 'Not allowed';
            }
   
            await groupsData.update(groupId, req.body.groupName, req.body.groupDescription, currentUser._id);
            return res.redirect("/groups/" + groupId);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    });

router
    .route('/delete/:groupId')
    .post(async (req, res) => {
        try {
            let groupId = req.params.groupId;
            let currentUser = req.session.user;

            helpers.isValidId(groupId);
            let groupObj = await groupsData.get(groupId);

            if (currentUser._id !== groupObj.groupLeader) {
                throw 'Not allowed';
            }

            await groupsData.remove(groupId);
            return res.redirect("/");
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    });

router
    .route('/join/:groupId')
    .post(async (req, res) => {
        try {
            let groupId = req.params.groupId;
            let currentUser = req.session.user;

            helpers.isValidId(groupId);
            await groupsData.addUser(currentUser._id, groupId);
            return res.redirect("/groups/" + groupId);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    })

router
    .route('/leave/:groupId')
    .post(async (req, res) => {
        try{
            let groupId = req.params.groupId;
            let currentUser = req.session.user;

            helpers.isValidId(groupId);
            await groupsData.leaveGroup(currentUser._id, groupId);
            return res.redirect("/groups/"+groupId);
        }
        catch(e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    })

export default router;
