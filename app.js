import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { gamesData } from './data/index.js';

import configRoutesFunction from './routes/index.js';

const app = express();

app.use(cookieParser());

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + '/public');
app.use('/public', staticDir);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(
    session({
        name: 'CoolSession',
        secret: 'crazy super secret signing key!',
        saveUninitialized: false,
        resave: false,
        // cookie: {maxAge: 60 * 1000}
    })
);

// Middleware that updates/stores currentUser object in app.locals for template usage.
app.use("/", (req, res, next) => {
    app.locals.currentUser = req.session.user;
    return next();
});

// Logging middleware
app.use("/", (req, res, next) => {
    const user = req.session.user;
    const auth = user ? 'Authenticated: ' + user.username : 'Not Authenticated';
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${auth})`);
    return next();
});

// Any authentication redirecting that we explicitly add can be here.
app.use("/", (req, res, next) => {
    const user = req.session.user;

    // For safety. Prevents unauth'd users from methods other than GET, except for POST-ing to /login and /register.
    if (user == null && req.method != "GET") {
        if (!(req.method == "POST" && ["/login", "/register"].includes(req.originalUrl))) {
            return res.redirect("/login");
        }
    }

    let onlyAuthenticatedRoutes = [
        "/logout",
        "/create-game",
        "/create-group"
    ];

    let onlyNonAuthenticatedRoutes = [
        "/login",
        "/register"
    ];

    if (user == null) {
        if (onlyAuthenticatedRoutes.includes(req.originalUrl)) {
            return res.redirect("/login");
        }
    } else {
        if (onlyNonAuthenticatedRoutes.includes(req.originalUrl)) {
            return res.redirect("/");
        }
    }
    return next();
});

// Update DB Middlware
app.use('/groups', async (req, res, next) => {
    if (req.method === 'GET') {
        try {
            await gamesData.keepStatusUpdated();
        } catch (err) {
            console.log(err);
        }
    }
    return next();
});

configRoutesFunction(app);

app.listen(3000, () => {
    console.log('Your routes will be running on http://localhost:3000');
});
