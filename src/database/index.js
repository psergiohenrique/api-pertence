import path from "path";
import Umzug from "umzug";

import Address from "../app/models/Address";
import Sequelize from "sequelize";
import User from "../app/models/User";
import databaseConfig from "../config/database";

const models = [Address, User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    this.migrate(this.connection);

    models.map((model) => model.init(this.connection));
    models.map(
      (model) => model.associate && model.associate(this.connection.models)
    );
  }

  /**
   * Apply all pending migrations.
   *
   * @param {Sequelize} sequelize the sequelize instance
   * @returns a promise that resolves after migrations are completed
   */
  migrate(sequelize) {
    const umzug = new Umzug({
      storage: "sequelize",

      storageOptions: {
        sequelize,
      },

      migrations: {
        params: [sequelize.getQueryInterface(), Sequelize],
        path: path.join(__dirname, "./migrations"),
      },
    });

    return umzug.up();
  }
}

export default new Database();
