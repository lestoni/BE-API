
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const moment = require('moment');

const { unitTestsFixtures } = require('../fixtures');
const {
  fetchContractById,
  fetchProfileContracts,
  fetchActiveUnpaidJobs,
  payContractor,
  fetchBestPaidProfession
} = require('../../src/controllers');

const expect = chai.expect;

chai.use(sinonChai);

describe('Deel::Controllers', () => {
  let sandbox;
  let dbDebsMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    dbDebsMock = null;
    sandbox.restore();
  });

  describe('Contracts', () => {
    it('should retrieve contract by id for a given client', async () => {
      dbDebsMock = {
        Contract: {
          findOne: sandbox.stub().resolves(unitTestsFixtures.mockContract)
        }
      };

      const got = await fetchContractById(dbDebsMock,  1, 1);

      expect(got).to.eql(unitTestsFixtures.mockContract);
      expect(dbDebsMock.Contract.findOne).to.have.been.calledOnce;
    });

    it('should retrieve contracts for given profile', async () => {
      dbDebsMock = {
        Contract: {
          findAll: sandbox.stub().resolves([unitTestsFixtures.mockContract])
        }
      }
      const got = await fetchProfileContracts(dbDebsMock, 1);

      expect(got).to.eql([unitTestsFixtures.mockContract]);
      expect(dbDebsMock.Contract.findAll).to.have.been.calledOnce;
    });
  });

  describe('Job', () => {
    it('should retrieve unpaid jobs with active Contracts', async () => {
      dbDebsMock = {
        Job: {
          findAll: sandbox.stub().resolves([unitTestsFixtures.mockJob])
        }
      };

      const got = await fetchActiveUnpaidJobs(dbDebsMock,  1, 1);

      expect(got).to.eql([unitTestsFixtures.mockJob]);
      expect(dbDebsMock.Job.findAll).to.have.been.calledOnce;
    });

    it('should do payment for a contract job', async () => {
      dbDebsMock = {
        sequelize: {
          transaction: sandbox.stub().resolves(true)
        }
      };

      const got = await payContractor(dbDebsMock,  1, 55);

      expect(got).to.eql(true);
      expect(dbDebsMock.sequelize.transaction).to.have.been.calledOnce;
    });
  });

  describe('Admin', () => {
    it('should retrieve best profession by date range', async () => {
      dbDebsMock = {
        Job: {
          findAll: sandbox.stub().resolves([{
            ...unitTestsFixtures.mockJob,
            Contract: {
              ContractId: 1
            }
          }])
        },
        sequelize: {
          fn: sandbox.stub().returns(100),
          col: sandbox.stub().returns()
        },
        Profile: {
          findByPk: sandbox.stub().resolves(unitTestsFixtures.mockProfile)
        }
      };

      const start = moment().subtract(10, 'days').format('YYYY-MM-DD');
      const end = moment().format('YYYY-MM-DD');

      const got = await fetchBestPaidProfession(dbDebsMock,  start, end);

      expect(got).to.eql({
        bestPayingProfession: unitTestsFixtures.mockProfile.profession
      });
      expect(dbDebsMock.Job.findAll).to.have.been.calledOnce;
      expect(dbDebsMock.Profile.findByPk).to.have.been.calledOnce;
    });
  });

});