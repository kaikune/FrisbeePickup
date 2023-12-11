import { Router } from 'express';

import { usersData, gamesData, groupsData } from "../data/index.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {

        
        if(req.session.user){
            return res.render("index", {title: "Home", user: req.session.user});
        }
        else{
            return res.render("index", {title: "Home"});
        }

        
    });

router  
    .route("/login")
    .get(async (req, res) => {
        return res.render("login", {title: "Login"});
    })
    .post(async (req, res) => {
        try {

            let emailAddress = req.body["login-emailAddress"];
            let password = req.body["login-password"];
            
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

            let createUserRes = await usersData.createUser(username, emailAddress, password);

            return res.redirect("/login");

        } catch (e) {
            res.status(400);
            res.json({error: e});
        }
    });

router  
    .route("/logout")
    .get(async (req, res) => {
        req.session.user = null;
        return res.render("logout", {title: "Logout"});
    });

router
    .route("/auth")
    .get(async (req, res) => {
        if (req.session.user != null) {
            return res.json({
                status: "You are currently logged in as " + req.session.user.username + " (" + req.session.user.emailAddress + ")"
            });
        } else {
            return res.json({
                status: "You aren't logged in at the moment!"
            });
        }
    });

export default router;