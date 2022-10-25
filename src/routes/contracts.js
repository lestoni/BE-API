const express = require('express');
const {fetchContractById} = require('../controllers')

const router = express.Router();

/**
 * GET /contracts/:id
 * @returns contract by id
 */
router.get('/:id', async (req, res) =>{
  const {Contract} = req.app.get('models')
  const {id} = req.params

  try {
    const contract = await fetchContractById(Contract, id)

    if(!contract) return res.status(404).end()
    res.json(contract)
  } catch(error) {
    res.json(error)
  }
});

module.exports = router;