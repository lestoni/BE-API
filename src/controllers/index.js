// FIXME: 
//  This can be put in different file name by resource when logic expands for this works
//  Arguments can be passed an object or requiring sequelize models here instead

const { Op } = require('sequelize');
const { CONTRACT_STATUS, PROFILE_TYPE } = require('../entities/constants');
const { Profile } = require('../services/sqlite/model');

/**
 * SQL Statement
 *  - SELECT * FROM Contracts WHERE id = 1 AND (ContractorId = N OR ClientId = N)
 * @param {SequelizeModel} contractModel 
 * @param {number} contractId 
 * @returns contract
 */
async function fetchContractById(db, contractId, profileId) {
  const { Contractor } = db;
  const contract = await Contract.findOne({
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
async function fetchProfileContracts(db, profileId) {
  const { Contract } = db;
  const contracts = await Contract.findAll({
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
async function fetchActiveUnpaidJobs(db, profileId) {
  const { Job, Contract } = db;
  const contracts = await Job.findAll({
    where: {
      paid: null
    },
    include: {
      model: Contract,
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


/**
 * 
 * @param {SequelizeModel} contractModel
 * @param {SequelizeModel} JobModel
 * @param {SequelizeModel} Profile 
 * @param {number} profileId 
 * @returns contracts list
 */
async function payContractor(db, jobId, amountToPay) {
  const { Job, Profile, Contract, sequelize } = db;

  const result = await sequelize.transaction(async (trx) => {
    // fetch job
    const job = await Job.findOne({
      where: { id: jobId },
      include: Contract
    }, { transaction: trx });
    // handle no job error
    if(!job) throw new Error('Job reference provided is invalid');

    // fetch client and credit their account
    const client = await Profile.findOne({
      where: {
        type: PROFILE_TYPE.CLIENT,
        id: job.Contract.ClientId
      }
    }, { transaction: trx });

    if (client.balance < amountToPay) throw new Error('Amount to Pay is less than your balance!')

    client.update({ balance: client.balance - amountToPay })
    await client.save()

    // fetch contractor and debit their account
    const contractor = await Profile.findOne({
      where: {
        type: PROFILE_TYPE.CONTRACTOR,
        id: job.Contract.ContractorId
      }
    }, { transaction: trx });

    contractor.update({ balance: contractor.balance + amountToPay })
    await contractor.save();

    return true;
  });

  return result;
}

/**
 * SQL Statement
 * 
 * YYYY-MM-DD -> DATE FORMATTING
 * 
 * SELECT SUM(Jobs.price), Profiles.profession FROM Jobs
 * JOIN Contracts ON Contracts.id = Jobs.ContractId
 * JOIN Profiles ON Profiles.type = 'contractor'
 * WHERE paymentDate BETWEEN '2020-08-15' AND '2020-08-17'
 * GROUP BY ContractId 
 * ORDER BY SUM(price) DESC
 * LIMIT 1;
 * 
 * @param {db} dbModels 
 * @param {number} profileId 
 * @returns contracts list
 */
 async function fetchBestPaidProfession(db, startDate, endDate) {
  const { Job, Contract, Profile, sequelize } = db;

  // TODO: use eager loading to fetch profile
  const jobs = await Job.findAll({
    include: {
      model: Contract,
      attributes: ['ContractorId']
    },
    where: {
      paid: 1,
      paymentDate: {
        [Op.lte]: endDate,
        [Op.gte]: startDate
      }
    },
    attributes: [
      'ContractId',
      [sequelize.fn('SUM', sequelize.col('price')), 'amount'],
    ],
    group: ['ContractId'],
    order: [
      ['amount', 'DESC']
    ],
    limit: 1
  });

  const professionProfile = await Profile.findByPk(jobs[0].Contract.ContractorId);
  return { bestPayingProfession: professionProfile.profession };
}

/**
 * SELECT SUM(price) AS amount, ClientId FROM Jobs
 * JOIN Contracts ON Contracts.id = Jobs.ContractId
 * JOIN Profiles ON Profiles.id = Contracts.ClientId
 * WHERE paymentDate >= '2020-08-10' AND paymentDate <= '2020-08-14 23:59:59.999'
 * 	  AND Jobs.paid = 1
 * GROUP BY ContractorId
 * ORDER BY amount DESC
 * 
 * @param {db} dbModels 
 * @param {number} profileId 
 * @returns contracts list
 */
 async function fetchBestPayingClient(db, startDate, endDate, recordsLimit) {
  const { Job, Contract, Profile, sequelize } = db;

  // TODO: use eager loading to improve querying
  const jobs = await Job.findAll({
    include: {
      model: Contract,
      attributes: ['ClientId']
    },
    where: {
      paid: 1,
      paymentDate: {
        [Op.lte]: endDate,
        [Op.gte]: startDate
      }
    },
    attributes: [
      'ContractId',
      [sequelize.fn('SUM', sequelize.col('price')), 'amount']
    ],
    group: ['ContractId'],
    order: [
      ['amount', 'DESC']
    ],
    limit: recordsLimit
  });

  const results = Promise.all(jobs.map(async (job) => {
    const professionProfile = await Profile.findByPk(job.Contract.ClientId);
    return {
      id: professionProfile.id,
      fullname: professionProfile.fullname,
      paid: job.getDataValue('amount')
    }
  }));

  return results;
}

module.exports = {
  fetchContractById,
  fetchProfileContracts,
  fetchActiveUnpaidJobs,
  payContractor,
  fetchBestPaidProfession,
  fetchBestPayingClient
}