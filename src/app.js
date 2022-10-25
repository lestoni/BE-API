const express = require('express');
const bodyParser = require('body-parser');

const {sequelize} = require('./services/sqlite/model');
const bindRoutesToApp = require('./routes/index');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

bindRoutesToApp(app);

module.exports = app;
