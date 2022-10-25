// This can be put in different file name by resource when logic expands for this works
const { Op } = require('sequelize');
const { CONTRACT_STATUS } = require('../entities/constants');

/**
 * SQL Statement
 *  - SELECT * FROM Contracts WHERE id = 1 AND (ContractorId = N OR ClientId = N)
 * @param {SequelizeModel} contractModel 
 * @param {number} contractId 
 * @returns contract
 */
async function fetchContractById(contractModel, contractId, profileId) {
  const contract = await contractModel.findOne({
    where: {
      id: contractId,
      [Op.or]: [
        { contractorId: profileId },
        { clientId: profileId }
      ]
    }
  });
  return contract;
}

/**
 * SQL Statement
 *  - SELECT * FROM Contracts WHERE (ClientId = 6 or ContractorId = 6) AND NOT status = 'terminated'
 * @param {SequelizeModel} contractModel 
 * @param {number} profileId 
 * @returns contracts list
 */
 async function fetchProfileContracts(contractModel, profileId) {
  const contracts = await contractModel.findAll({
    where: {
      [Op.or]: [
        { contractorId: profileId },
        { clientId: profileId }
      ],
      status: {
        [Op.not]: CONTRACT_STATUS.TERMINATED
      }
    }
  });
  return contracts;
}



module.exports = {
  fetchContractById,
  fetchProfileContracts,
}