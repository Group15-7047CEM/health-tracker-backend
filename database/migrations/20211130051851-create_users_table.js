'use strict';

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS "users" ("id" UUID NOT NULL UNIQUE , "firstName" VARCHAR(255) NOT NULL, "lastName" VARCHAR(255), "email" VARCHAR(255), "phoneNumber" VARCHAR(255), "loginToken" VARCHAR(255), "lastLoginAt" TIMESTAMP WITH TIME ZONE, "password" VARCHAR(255), "expirePasswordAt" DATE, "role" VARCHAR(255), "status" "public"."enum_users_status" DEFAULT 'inactive', "mobileVerified" BOOLEAN DEFAULT false, "isLoggedIn" BOOLEAN DEFAULT false, "profileImage" VARCHAR(255), "emailVerified" BOOLEAN DEFAULT false, "emailVerifyToken" VARCHAR(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("id"));`)
    ])
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('users')
  }
};
