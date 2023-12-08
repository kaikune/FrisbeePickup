// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import { groupsData, gamesData, usersData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        res.render('searchForm');
    })
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
            // Need to change to an actual search
            groups = await groupsData.getAll();
        } catch (err) {
            errors.push(err);
        }

        try {
            // Need to change to an actual search
            games = await gamesData.getAll();
        } catch (err) {
            errors.push(err);
        }

        res.render('searchResults', { users, groups, games, errors });
    });

export default router;
