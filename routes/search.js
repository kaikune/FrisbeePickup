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

        /**

        let errors = [];
        let users = [];
        let groups = [];
        let games = [];

        try{
            users = await usersData.getAllUsers();
        }
        catch(err){
            errors.push(err);
        }
        try{
            groups = await groupsData.getAll();
        }
        catch(err){
            errors.push(err);
        }
        try{
            games = await gamesData.getAll();
        }
        catch(err){
            errors.push(err);
        }
        **/

        // res.render('searchForm', {title:"Search", players: users, groups: groups, games: games});
        return res.json(data);
    });
    /**
    .post(async (req, res) => {
        const query = req.body['search-form'];
        let errors = [];
        let users = [];
        let groups = [];
        let games = [];

        try {
            users = await usersData.findUsersThatStartWith(query);
        } catch (err) {
            errors.push(err);
        }

        try {
            groups = await groupsData.findGroupsThatStartWith(query);
        } catch (err) {
            errors.push(err);
        }

        try {
            games = await gamesData.findGamesThatStartWith(query);
        } catch (err) {
            errors.push(err);
        }

        res.render('searchResults', { title: "Search Results", users, groups, games, errors });
    });
    **/

export default router;
