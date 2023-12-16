import usersRoutes from './users.js';
import gamesRoutes from './games.js';
import groupsRoutes from './groups.js';
import mainRoutes from './main.js';
import searchRoutes from './search.js';
import weatherRoutes from './weather.js';

const configRoutesFunction = (app) => {
    app.use('/users', usersRoutes);
    app.use('/games', gamesRoutes);
    app.use('/groups', groupsRoutes);
    app.use('/search', searchRoutes);
    app.use('/weather', weatherRoutes);
    app.use('/', mainRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Not Found' });
    });
};

export default configRoutesFunction;
