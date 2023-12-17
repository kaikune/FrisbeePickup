import { Router } from 'express';

import { usersData, gamesData, groupsData } from '../data/index.js';
import * as helpers from '../helpers.js';
const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        let allGroupObjs = await groupsData.getAll();
        return res.render('createGroup', {title:"Create group", groups: allGroupObjs});
    })
    .post(async (req, res) => {
        const groupName = req.body.groupName;
        const groupDescription = req.body.groupDescription;
        
        if(!req.session.user) return res.status(400).json({ error: "Must be logged in" });
        const groupLeader = req.session.user._id;
        try {
            helpers.validateGroup(groupName, groupDescription, groupLeader)
            const createResult = await groupsData.create(groupName, groupDescription, groupLeader);     
            res.redirect(`groups/${createResult._id}`);
        } catch (err) {
            return res.status(400).json({ error: err });
        }
    });

router.route('/:groupId').get(async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const groupObj = await groupsData.get(groupId);
        let players=  groupObj.players;
        players = players.filter(player => player !== groupObj.groupLeader)
        const members = await usersData.getIDName(players);
        let games = await gamesData.getAllByGroup(groupId);
        games = games.map(game => ({_id: game._id, name: game.gameName}));
        const owner = await usersData.getUser(groupObj.groupLeader);
        let isMember = false;
        if(req.session.user){
            if(groupObj.players.includes(req.session.user._id)){
                isMember = true;
            }
        }
        return res.render('group', {
            title:"Group",
            group: groupObj,
            members: members,
            games: games,
            owner: {_id: owner._id, username: owner.username},
            isMember: isMember
        });
    } catch (e) {
        res.status(400);
        res.json({ error: e });
    }
});

router.route('/:groupId/comments').post(async (req, res) => {
    try {
        let groupId = req.params.groupId;
        let comment = req.body.comment;
        let userId = req.body.userId;

        let groupRes = await groupsData.addComment(groupId, userId, comment);
        return res.json(groupRes);
    } catch (e) {
        if (e === 'Could not update group successfully') return res.status(500).json({ error: e });
        return res.status(400).json({ error: e });
    }
});

router
    .route('/edit/:groupId')
    .get(async (req, res) => {

        let groupId = req.params.groupId;

        return res.render("editGroups", {title:"Edit group"});
    })
    .post(async (req, res) => {
        return res.json({"TODO":"Implement"});
    });

router
    .route('/delete/:groupId')
    .post(async (req, res) => {
        return res.json({"TODO":"Implement"});
    });

export default router;
