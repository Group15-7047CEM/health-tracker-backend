'use strict';

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS "user_passwords" ("id" UUID NOT NULL UNIQUE , "password" TEXT NOT NULL UNIQUE, "userId" UUID REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("id"));`)
    ])
  },

  down: (queryInterface) => {
      return queryInterface.dropTable('user_passwords')
  }
};
