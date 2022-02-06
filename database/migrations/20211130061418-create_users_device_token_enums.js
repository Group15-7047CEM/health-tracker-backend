'use strict';

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`CREATE TYPE "public"."enum_user_device_tokens_tokenType" AS ENUM('fcm_token');`)
    ])
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`DROP TYPE "public"."enum_user_device_tokens_tokenType";`)
    ])
  }
};
