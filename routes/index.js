import usersRoutes from './users.js';
import gamesRoutes from './games.js';
import groupsRoutes from './groups.js';
import mainRoutes from './main.js';
import searchRoutes from './search.js';
import picturesRoutes from './pictures.js';

const configRoutesFunction = (app) => {
    app.use('/users', usersRoutes);
    app.use('/games', gamesRoutes);
    app.use('/groups', groupsRoutes);
    app.use('/search', searchRoutes);
    app.use('/pictures', picturesRoutes);
    app.use('/', mainRoutes);

    app.get('/config', (req, res) => {
        res.json({
            SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
        });
    });

    app.use('*', (req, res) => {
        return res.status(404).render('error', { title: 'Error', error: 'Not Found' });
    });
};

export default configRoutesFunction;
