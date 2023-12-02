// import attendeesRoute from './attendees.js';
// import eventsRoute from './events.js';

const configRoutesFunction = (app) => {
    // app.use('/events', eventsRoute);
    // app.use('/attendees', attendeesRoute);

    app.use("/", (req, res, next) => {
        if (req.path == "/") {
            return res.render("index", {title: "Home"});
        } else {
            return next();
        }
    });

    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Not Found' });
    });
};

export default configRoutesFunction;
