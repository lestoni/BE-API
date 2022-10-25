const express = require('express');
const { fetchBestPaidProfession, fetchBestPayingClient } = require('../controllers');

const router = express.Router();

/**
 * GET /admin/best-profession?start=<date>&end=<date>
 * @returns bestProfession most paid profession
 */
 router.get('/best-profession', async (req, res) =>{
  const {Contract, Job, Profile } = req.app.get('models');
  const { start, end } = req.query;
  const sequelize = req.app.get('sequelize');

  try {
    const bestProfession = await fetchBestPaidProfession({
      Contract, Job, Profile, sequelize
    }, start, end);
    
    res.json(bestProfession);
  } catch(error) {
    console.log(error)
    res.status(500);
    res.json({
      error: {
        message: error.message
      }
    });
  }
});

/**
 * GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>
 * @returns bestClients most paid profession
 */
 router.get('/best-clients', async (req, res) =>{
  const { Contract, Job, Profile } = req.app.get('models');
  const { start, end, limit } = req.query;
  const sequelize = req.app.get('sequelize');

  try {
    const bestClients = await fetchBestPayingClient({
      Contract, Job, Profile, sequelize
    }, start, end, parseInt(limit || 2, 10) );
    
    res.json(bestClients);
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