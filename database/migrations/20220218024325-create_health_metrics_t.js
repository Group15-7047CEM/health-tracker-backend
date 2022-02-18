'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS "user_health_metrics" 
          (
            "id" UUID NOT NULL UNIQUE, 
            "weight" FLOAT,
            "steps" INTEGER DEFAULT 0,
            "waterIntake" INTEGER DEFAULT 0,
            "activityMins" INTEGER DEFAULT 0,
            "sleepStartTime" TIMESTAMP WITH TIME ZONE,
            "sleepEndTime" TIMESTAMP WITH TIME ZONE,
            "sleepMins" INTEGER DEFAULT 0,
            "trackedDate" DATE NOT NULL,
            "userId" UUID REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, 
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, 
            "deletedAt" TIMESTAMP WITH TIME ZONE, 
            PRIMARY KEY ("id")
          );
        `
      )
    ]);
  },

  down: async (queryInterface, Sequelize) => {
     return queryInterface.dropTable('user_health_metrics');
  }
};
