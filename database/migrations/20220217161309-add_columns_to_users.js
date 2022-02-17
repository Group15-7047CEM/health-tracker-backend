'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('users', 'address', 
          { type: Sequelize.TEXT },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'city', 
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'country', 
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'postcode', 
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'gender', 
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'dob', 
          { type: Sequelize.DATEONLY },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'currentWeight', 
          { type: Sequelize.FLOAT },
          { transaction: t }
        ),
        queryInterface.addColumn('users', 'height', 
          { type: Sequelize.FLOAT },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('users', 'address', { transaction: t }),
        queryInterface.removeColumn('users', 'country', { transaction: t }),
        queryInterface.removeColumn('users', 'city', { transaction: t }),
        queryInterface.removeColumn('users', 'postcode', { transaction: t }),
        queryInterface.removeColumn('users', 'gender', { transaction: t }),
        queryInterface.removeColumn('users', 'dob', { transaction: t }),
        queryInterface.removeColumn('users', 'currentWeight', { transaction: t }),
        queryInterface.removeColumn('users', 'height', { transaction: t })
      ])
    });
  }
};
