'use strict';

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'inactive');`)
    ])
  },

  down: (queryInterface) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP TYPE "public"."enum_users_status";`)
      ])
  }
};
