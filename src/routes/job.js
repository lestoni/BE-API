const express = require('express');
const { fetchActiveUnpaidJobs, payContractor } = require('../controllers');

const router = express.Router();

/**
 * Get all unpaid jobs for active contracts for a user.
 * 
 * GET /jobs/unpaid
 * 
 * @returns contracts for user in session
 */
 router.get('/unpaid', async (req, res) =>{
  const {Job, Contract} = req.app.get('models');
  const {id: profileId } = req.profile;

  try {
    const jobs = await fetchActiveUnpaidJobs({
      Job,
      Contract
    }, profileId);

    res.json(jobs);
  } catch(error) {
    res.status(500);
    res.json({
      error: {
        message: error.message
      }
    });
  }
});

/**
 * Client Paying a contractor for a job well done
 * 
 * GET /jobs/:job_id/pay
 * 
 * @returns contracts for user in session
 */
 router.post('/:job_id/pay', async (req, res) =>{
  const {Job, Contract, Profile } = req.app.get('models');
  const sequelize = req.app.get('sequelize');
  // FIXME: Use data validation for inputs
  const { amountToPay } = req.body; // Worth to note we are working with money value hence .2f
  const {job_id} = req.params;

  try {
    const paymentStatus = await payContractor({
      Contract, Job, Profile, sequelize
    }, job_id, amountToPay);

    res.json({ success: paymentStatus });
  } catch(error) {
    res.status(500);
    res.json({
      error: {
        message: error.message
      }
    });
  }
});

module.exports = router;