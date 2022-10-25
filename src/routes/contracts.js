const express = require('express');
const { fetchContractById, fetchProfileContracts } = require('../controllers');

const router = express.Router();

/**
 * GET /contracts
 * @returns contracts for user in session
 */
 router.get('/', async (req, res) =>{
  const {Contract} = req.app.get('models');
  const {id: profileId } = req.profile;

  try {
    const contracts = await fetchProfileContracts({
      Contract
    }, profileId);
    
    res.json(contracts);
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
 * GET /contracts/:id
 * @returns contract by id
 */
router.get('/:id', async (req, res) =>{
  const {Contract} = req.app.get('models');
  const {id: contractId} = req.params;
  const {id: profileId } = req.profile;

  try {
    const contract = await fetchContractById({
      contract
    }, contractId, profileId)

    if(!contract) return res.status(404).end()

    res.json(contract)
  } catch(error) {
    res.json(error)
  }
});

module.exports = router;