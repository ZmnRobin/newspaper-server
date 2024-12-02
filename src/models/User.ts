import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define the attributes for the User model
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

// Optional fields for creating a new User (id and role are optional)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

// Extend the Sequelize Model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'user';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Function to initialize the model
const initUserModel = (sequelize: Sequelize) => {
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Explicitly define the table name
    timestamps: true,
  });

  return User;
};

export { User };
export default initUserModel;
