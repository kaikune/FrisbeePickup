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
