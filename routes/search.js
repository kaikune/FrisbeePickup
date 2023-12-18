import { Router } from 'express';
import { groupsData, gamesData, usersData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {

        let term = req.query.term;
        if (term == null) {
            return res.render("search", {title: "Search"});
        }
        term = term.trim();

        let usersList, groupsList, gamesList;

        try {
            if (term == "") {
                usersList = await usersData.getAllUsers();
            } else {
                usersList = await usersData.findUsersThatStartWith(term);
            }
        } catch (e) {
            usersList = [];
        }
        try {
            if (term == "") {
                groupsList = await groupsData.getAll();
            } else {
                groupsList = await groupsData.findGroupsThatStartWith(term);
            }
        } catch (e) {
            groupsList = [];
        }
        try {
            if (term == "") {
                gamesList = await gamesData.getAll();
            } else {
                gamesList = await gamesData.findGamesThatStartWith(term);
            }
        } catch (e) {
            gamesList = [];
        }

        let data = {users: usersList, groups: groupsList, games: gamesList};

        return res.json(data);
    });

export default router;
