
const chai = require('chai');
const moment = require('moment');
const request = require('supertest');
const app = require('../../src/app');
const { TestDBService } = require('../fixtures');

const expect = chai.expect;
const dbService = new TestDBService();

describe('Deel::API', () => {
  before(async () => {
    await dbService.addTestData();
  });

  after(async () => {
    await dbService.removeTestData();
  })

  describe('Contracts', () => {
    // FIXME: For more accuracy, it should have for both client and contractor test cases
    it('GET /contracts/:id should return the contract belonging to user in session', async () => {
      const response = await request(app)
        .get(`/contracts/${dbService.clientId * 2}`)
        .set('profile_id', dbService.clientId);

      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);

      const contract = response.body;

      expect(contract).to.have.property('ClientId')
      expect(contract.ClientId).to.equal(dbService.clientId)
    });


    it('GET /contracts should return the contract belonging to user in session', async () => {
      const response = await request(app)
        .get('/contracts')
        .set('profile_id', dbService.contractorId);

      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);

      const contracts = response.body;
      contracts.forEach(contract => {
        expect(contract.ContractorId).to.equal(dbService.contractorId)
      });
      expect(contracts).to.have.length(3);
    });
  });

  describe('Jobs', () => {
    it('GET /jobs/unpaid should return all unpaid jobs with active contracts for user in session', async () => {
      const response = await request(app)
        .get('/jobs/unpaid')
        .set('profile_id', dbService.clientId);

      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);

      const jobs = response.body;

      jobs.forEach(job => {
        expect(job.Contract.ContractorId).to.equal(dbService.contractorId)
      });
      expect(jobs).to.have.length(2)
    });

    it('POST /jobs/:job_id/pay should return all unpaid jobs with active contracts for user in session', async () => {
      const response = await request(app)
        .post(`/jobs/${dbService.contractorId * 3}/pay`)
        .set('profile_id', dbService.clientId)
        .send({
          amountToPay: 1
        });

      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);

      const paymentResponse = response.body;

      expect(paymentResponse).to.have.property('success');
      expect(paymentResponse.success).to.equal(true)
    });
  });

  describe('admin', () => {
    it('GET /admin/best-profession?start=<date>&end=<date> should retrieve most paid profession by period range', async () => {
      const start = moment().subtract(10, 'days').format('YYYY-MM-DD');
      const end = moment().format('YYYY-MM-DD');
      
      const response = await request(app)
        .get('/admin/best-profession')
        .set('profile_id', dbService.adminId)
        .query({
          end,
          start
        });

      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);

      const result = response.body;
      expect(result.bestPayingProfession).to.equal('Handyman');
    });

    it('GET /admin/best-clients?start=<date>&end=<date>&limit=<integer> should retrieve most paid clients by period range ', async () => {
      const start = moment().subtract(10, 'days').format('YYYY-MM-DD');
      const end = moment().format('YYYY-MM-DD');
      
      const response = await request(app)
        .get('/admin/best-clients')
        .set('profile_id', dbService.adminId)
        .query({
          end,
          start
        });

      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);

      const result = response.body;
      expect(result).to.have.length(1);
      expect(result[0]).to.eql({ id: 10000, fullname: 'Tony Stark', paid: 30 })
    });
  });
});