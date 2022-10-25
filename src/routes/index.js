const { getProfile } = require("../middleware/getProfile");
const contractRouter = require('./contracts');
const jobRouter = require('./job')

function bindRoutesToApp(app) {

  // CONTRACTS
  app.use('/contracts', getProfile, contractRouter);

  // JOBS
  app.use('/jobs', getProfile, jobRouter);
}

module.exports = bindRoutesToApp;