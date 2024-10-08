import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';
import cors from 'cors';

import { gamesData } from './data/index.js';

import configRoutesFunction from './routes/index.js';

const app = express();

app.use(cookieParser());
app.use(express.json());

const corsOptions = {
    origin: true,
};

app.use(cors(corsOptions));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + '/public');
app.use('/public', staticDir);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var hbs = exphbs.create({
    // Set helper functions
    helpers: {
        ifEquals: function (arg1, arg2, options) {
            return arg1 == arg2 ? options.fn(this) : options.inverse(this);
        },
        elseEquals: function (arg1, arg2, options) {
            return arg1 != arg2 ? options.fn(this) : options.inverse(this);
        },
    },
    defaultLayout: 'main',
    partialsDir: __dirname + '/views',
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(
    session({
        name: 'CoolSession',
        secret: 'crazy super secret signing key!',
        saveUninitialized: false,
        resave: false,
        cookie: { maxAge: 60 * 10000 }, // 1 hr
    })
);

// Middleware that updates/stores currentUser object in app.locals for template usage.
app.use('/', (req, res, next) => {
    res.locals.currentUser = req.session.user;
    return next();
});

// Logging middleware
app.use('/', (req, res, next) => {
    const user = req.session.user;
    const auth = user ? 'Authenticated: ' + user.username : 'Not Authenticated';
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${auth})`);
    return next();
});

// Any authentication redirecting that we explicitly add can be here.
app.use('/', (req, res, next) => {
    const user = req.session.user;

    // For safety. Prevents unauth'd users from methods other than GET, except for POST-ing to /login and /register.
    if (user == null && req.method != 'GET') {
        if (!(req.method == 'POST' && ['/login', '/register'].includes(req.originalUrl))) {
            return res.redirect('/login');
        }
    }

    let onlyAuthenticatedRoutes = ['/logout', '/create-event', '/create-group'];

    let onlyNonAuthenticatedRoutes = ['/login', '/register'];

    if (user == null) {
        if (onlyAuthenticatedRoutes.includes(req.originalUrl)) {
            return res.redirect('/login');
        }
    } else {
        if (onlyNonAuthenticatedRoutes.includes(req.originalUrl)) {
            return res.redirect('/');
        }
    }
    return next();
});

// Update DB Middlware
app.use('/games', async (req, res, next) => {
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

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Up and running on port ${port}!`);
});
