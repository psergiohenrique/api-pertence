/**
 * Migration file to create the user_apps table.
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('address', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      street: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      city: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      uf: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      neighborhood: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      state: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      country: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      number: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('address');
  },
};
