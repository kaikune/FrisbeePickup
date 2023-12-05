import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        return res.render("index", {title: "Home"});
    });

router  
    .route("/login")
    .get(async (req, res) => {
        return res.render("login", {title: "Login"});
    })
    .post(async (req, res) => {
        try {

            let emailAddress = req.body.emailAddress;
            let password = req.body.password;
            
            let userInfo = await usersData.loginUser(emailAddress, password);
            req.session.user = userInfo;

            return res.redirect("/");

        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

router  
    .route("/register")
    .get(async (req, res) => {
        return res.render("register", {title: "Register"});
    })
    .post(async (req, res) => {
        try {

            let emailAddress = req.body.emailAddress;
            let password = req.body.password;
            let username = req.body.username;

            let res = await usersData.createUser(username, emailAddress, password);

            return res.redirect("/login");

        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

router  
    .route("/logout")
    .get(async (req, res) => {
        res.json({status: "Logout coming soon!"});
    });

export default router;