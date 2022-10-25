const { getProfile } = require("../middleware/getProfile");
const contractRouter = require('./contracts')

function bindRoutesToApp(app) {
  app.use('/contracts', getProfile, contractRouter);
}

module.exports = bindRoutesToApp;