import { DataTypes, Model } from 'sequelize';

class Address extends Model {
  static init(sequelize) {
    super.init(
      {
        streeet: DataTypes.STRING,
        city: DataTypes.STRING,
        uf: DataTypes.STRING,
        neighborhood: DataTypes.STRING,
        state: DataTypes.STRING,
        country: DataTypes.STRING,
        number: {
          type: DataTypes.STRING,
          validate: {
            isNumeric: true,
          },
          field: 'number',
        },
      },
      {
        sequelize,
        tableName: 'address',
        timestamps: false,
      }
    );
    return this;
  }
}

export default Address;
