// models/Visitor.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

interface VisitorAttributes {
  id: number;
  user_ip: string;
}

class Visitor extends Model<VisitorAttributes> implements VisitorAttributes {
  public id!: number;
  public user_ip!: string;
}

export const initVisitorModel = (sequelize: Sequelize) => {
  Visitor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Visitor',
      tableName: 'Visitors',
    }
  );
  return Visitor;
};