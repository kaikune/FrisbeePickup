import express from 'express';
import exphbs from 'express-handlebars';

import configRoutesFunction from './routes/index.js';

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutesFunction(app);

app.listen(3000, () => {
    console.log('Your routes will be running on http://localhost:3000');
});
