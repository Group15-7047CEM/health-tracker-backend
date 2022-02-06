'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: UUID } = require('uuid');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const roles = require('../roles.json')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction;
    try{
      const date  =  new Date()
      const rolesToCreate = roles.map((role,index) => {
        return {
          id: UUID(),
          label: role.label,
          permissions: role.permissions,
          createdAt: new Date(date.getTime() + (index * 10 * 1000)),
          updatedAt: new Date(date.getTime() + (index * 10 * 1000))
        }
      });
      transaction = await queryInterface.sequelize.transaction();
      await queryInterface.bulkInsert('roles', rolesToCreate, transaction); 
      await transaction.commit();
    }
    catch(err){
      await transaction.rollback();
      throw err
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {});
  }
};
