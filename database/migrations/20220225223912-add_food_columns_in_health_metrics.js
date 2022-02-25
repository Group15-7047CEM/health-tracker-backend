'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('user_health_metrics', 'totalCalories', 
          { type: Sequelize.INTEGER, defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.addColumn('user_health_metrics', 'foodItems', 
          { type: Sequelize.ARRAY(Sequelize.JSON), defaultValue: [] },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('user_health_metrics', 'totalCalories', { transaction: t }),
        queryInterface.removeColumn('user_health_metrics', 'foodItems', { transaction: t }),
      ])
    });
  }
};
