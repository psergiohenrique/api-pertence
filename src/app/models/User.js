import { DataTypes, Model } from "sequelize";

import bcrypt from "bcryptjs";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        username: DataTypes.STRING,
        fullName: {
          type: DataTypes.STRING,
          field: "full_name",
        },
        email: DataTypes.STRING,
        profile_image: DataTypes.STRING,
        pass: DataTypes.VIRTUAL,
        password: DataTypes.STRING,
        enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        role: DataTypes.STRING,
        phone: {
          type: DataTypes.STRING,
          validate: {
            isNumeric: true,
            len: [10, 11],
          },
          field: "phone",
        },
        creation: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        textToSpeech: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: "text_to_speech",
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: false,
      }
    );

    this.addHook("beforeSave", async (user) => {
      if (user.pass) {
        const hash = await bcrypt.hash(user.pass, 8);

        user.password = hash.replace("$2b", "$2a");
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Address, {
      foreignKey: {
        name: "addressId",
        field: "address_id",
      },
      as: "address",
    });
  }

  async checkPassword(password) {
    // If the user has no password set, means it's a facebook user and should login using it
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(password, this.password.replace("$2a", "$2b"));
  }
}

export default User;
