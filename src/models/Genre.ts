import { DataTypes, Model, Optional, Sequelize, Association } from 'sequelize';
import { Article } from './Article'; // Import the Article model

interface GenreAttributes {
  id: number;
  name: string;
}

interface GenreCreationAttributes extends Optional<GenreAttributes, 'id'> {}

class Genre extends Model<GenreAttributes, GenreCreationAttributes> implements GenreAttributes {
  public id!: number;
  public name!: string;

  // Define the association with Article
  public static associations: {
    articles: Association<Genre, Article>;
  };
}

const initGenreModel = (sequelize: Sequelize) => {
  Genre.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Genre',
    tableName: 'Genres',
    timestamps: false,
  });

  return Genre;
};

export { Genre, GenreAttributes, GenreCreationAttributes };
export default initGenreModel;