/**
 * Migration file to create the user_apps table.
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      phone: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      profile_image: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      text_to_speech: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      role: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: false,
        allowNull: false,
      },
      creation: {
        type: Sequelize.DataTypes.DATETIME,
        defaultValue: Sequelize.DataTypes.NOW,
        allowNull: false,
      },
      enabled: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('users');
  },
};
