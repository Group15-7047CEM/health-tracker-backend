'use strict';

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`CREATE UNIQUE INDEX "users_phone_number" ON "users" ("phoneNumber") WHERE "deletedAt" IS NULL`),
      queryInterface.sequelize.query(`CREATE UNIQUE INDEX "users_email" ON "users" ("email") WHERE "deletedAt" IS NULL`)
    ])
  },

  down: (queryInterface) => {
      return Promise.all([
        queryInterface.removeIndex('users', 'users_phone_number'),
        queryInterface.removeIndex('users', 'users_email')
      ])
  }
};
