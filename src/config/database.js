require("dotenv/config");
const logger = require("../utils/logger").default;

module.exports = {
  dialect: "mysql",
  host: "mysql.onecause.kinghost.net",
  port: 3306,
  username: "onecause01",
  password: "master8",
  database: "onecause01",
  migrationStorageTableName: "sequelize_meta",
  logging: logger.debug.bind(logger),
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
