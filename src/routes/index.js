const { getProfile, isAuthorized } = require("../middleware/getProfile");
const contractRouter = require('./contracts');
const jobRouter = require('./job');
const adminRouter = require('./admin');
const { PROFILE_TYPE } = require("../entities/constants");

function bindRoutesToApp(app) {

  // CONTRACTS
  app.use('/contracts', getProfile, contractRouter);

  // JOBS
  app.use('/jobs', getProfile, jobRouter);

  // ADMIN
  app.use('/admin', getProfile, isAuthorized(PROFILE_TYPE.ADMIN), adminRouter);
}

module.exports = bindRoutesToApp;