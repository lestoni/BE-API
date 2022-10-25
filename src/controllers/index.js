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
async function fetchContractById(ContractModel, contractId, profileId) {
  const contract = await ContractModel.findOne({
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
 async function fetchProfileContracts(ContractModel, profileId) {
  const contracts = await ContractModel.findAll({
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

/**
 * SQL Statement
 * 
 * SELECT ContractorId, ClientId, ContractId, paid FROM Jobs
 * JOIN Contracts ON Contracts.id = Jobs.ContractId
 * WHERE 
 *   paid IS NULL 
 *   AND (ContractorId = 6 OR ClientId = 6)
 *   AND status IS NOT "terminated"
 * 
 * @param {SequelizeModel} contractModel 
 * @param {number} profileId 
 * @returns contracts list
 */
 async function fetchActiveUnpaidJobs(ContractModel, JobModel, profileId) {
  const contracts = await JobModel.findAll({
    where: {
      paid: null
    },
    include: {
      model: ContractModel,
      where: {
        [Op.or]: [
          { contractorId: profileId },
          { clientId: profileId }
        ],
        status: {
          [Op.not]: CONTRACT_STATUS.TERMINATED
        }
      }
    }
  });

  return contracts;
}



module.exports = {
  fetchContractById,
  fetchProfileContracts,
  fetchActiveUnpaidJobs
}