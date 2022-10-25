const express = require('express');
const { fetchActiveUnpaidJobs } = require('../controllers');

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
    const jobs = await fetchActiveUnpaidJobs(Contract, Job, profileId);
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

module.exports = router;