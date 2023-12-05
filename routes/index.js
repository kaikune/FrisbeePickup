import usersRoutes from './users.js';
import gamesRoutes from './games.js';
import groupsRoutes from './groups.js';
import mainRoutes from "./main.js";

const configRoutesFunction = (app) => {
    app.use("/", mainRoutes);
    app.use("/users", usersRoutes);
    app.use("/games", gamesRoutes);
    app.use("/groups", groupsRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Not Found' });
    });
};

export default configRoutesFunction;
