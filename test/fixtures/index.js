const moment = require('moment');
const { Profile, Contract, Job } = require('../../src/services/sqlite/model');

class TestDBService {

  constructor() {
    this.clientId = 10000;
    this.contractorId = 20000;
    this.adminId = 30000;
  }

  async addTestData() {
    await Profile.sync();
    await Contract.sync();
    await Job.sync();

    await Promise.all([
      // Profiles
      Profile.create({
        id: this.clientId,
        firstName: 'Tony',
        lastName: 'Stark',
        profession: 'Engineer',
        balance: 50,
        type: 'client'
      }),
      Profile.create({
        id: this.contractorId,
        firstName: 'Mr',
        lastName: 'Groot',
        profession: 'Handyman',
        balance: 1200,
        type: 'contractor'
      }),
      Profile.create({
        id: this.adminId,
        firstName: 'Rocket',
        lastName: 'Raccoon',
        profession: 'Not a rabbit',
        balance: 200,
        type: 'admin'
      }),

      // Contracts
      Contract.create({
        id: this.clientId * 2,
        terms: 'Give jarvis sense of humor',
        status: 'in_progress',
        ClientId: this.clientId,
        ContractorId: this.contractorId
      }),
      Contract.create({
        id: this.clientId * 3,
        terms: 'Something catchy',
        status: 'new',
        ClientId: this.clientId,
        ContractorId: this.contractorId
      }),
      Contract.create({
        id: this.clientId * 4,
        terms: 'y not',
        status: 'in_progress',
        ClientId: this.clientId,
        ContractorId: this.contractorId
      }),

      // JOB
      Job.create({
        id: this.contractorId * 2,
        description: 'avengers todo list #1',
        price: 30,
        paid: true,
        paymentDate: moment().subtract(2, 'days').toISOString(),
        ContractId: this.clientId * 2,
      }),
      Job.create({
        id: this.contractorId * 3,
        description: 'onboard antman',
        price: 1,
        ContractId: this.clientId * 3,
      }),
      Job.create({
        id: this.contractorId * 4,
        description: 'i am groot',
        price: 5,
        ContractId: this.clientId * 4
      })
    ]);
  }
  async removeTestData() {
    await Promise.all([
      // JOB
      Job.destroy({
        where: {
          ContractId: this.clientId * 2,
        }
      }),
      Job.destroy({
        where: {
          ContractId: this.clientId * 3,
        }
      }),
      Job.destroy({
        where: {
          ContractId: this.clientId * 4,
        }
      }),
      // Contracts
      Contract.destroy({
        where: {
          id: this.clientId * 2
        }
      }),
      Contract.destroy({
        where: {
          id: this.clientId * 3
        }
      }),
      Contract.destroy({
        where: {
          id: this.clientId * 4
        }
      }),

      // Profiles
      Profile.destroy({
        where: {
          id: this.clientId
        }
      }),
      Profile.destroy({
        where: {
          id: this.contractorId
        }
      }),
      Profile.destroy({
        where: {
          id: this.adminId,
        }
      })
    ]);
  }
}

const unitTestsFixtures = {
  mockContract: {
    id: 1,
    terms: 'test terms',
    status: 'in_progress',
    ClientId: 1,
    ContractorId: 1
  },
  mockJob: {
    description: 'test work',
    price: 1010,
    paid: true,
    paymentDate: moment().toISOString(),
    ContractId: 1,
  },
  mockProfile: {
    id: 1,
    firstName: 'Captain',
    lastName: 'Marvel',
    profession: 'Traveller',
    balance: 200,
    type: 'contractor'
  }
}

module.exports = {
  TestDBService,
  unitTestsFixtures
}