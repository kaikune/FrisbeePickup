import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import configRoutesFunction from './routes/index.js';

const app = express();

app.use(cookieParser());

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + '/public');
app.use('/public', staticDir);

app.use(
    session({
        name: 'CoolSession',
        secret: 'crazy super secret signing key!',
        saveUninitialized: false,
        resave: false,
        // cookie: {maxAge: 60 * 1000}
    })
);

// Logging and Authentication Middleware
app.use('/', (req, res, next) => {
    const user = req.session.user;
    const auth = user ? 'Authenticated' : 'Not Authenticated';
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${auth})`);

    if (['/login', '/register', '/logout', '/'].includes(req.originalUrl)) return next();

    if (user) {
        if (!['/admin', '/protected', '/error'].includes(req.originalUrl)) {
            if (user.role === 'admin') return res.redirect('/admin');
            if (user.role === 'user') return res.redirect('/protected');
        }
    } else {
        return res.redirect('/login');
    }

    return next();
});

// Logout Middleware
app.use('/logout', (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (!req.session.user) return res.redirect('/login');

    return next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutesFunction(app);

app.listen(3000, () => {
    console.log('Your routes will be running on http://localhost:3000');
});
