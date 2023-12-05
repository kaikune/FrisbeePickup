import express from 'express';
import exphbs from 'express-handlebars';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

import configRoutesFunction from './routes/index.js';

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + '/public');
app.use('/public', staticDir);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutesFunction(app);

app.listen(3000, () => {
    console.log('Your routes will be running on http://localhost:3000');
});
