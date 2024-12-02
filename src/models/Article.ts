import { DataTypes, Model, Optional, Sequelize, Association } from 'sequelize';
import { Genre } from './Genre'; // Import the Genre model

interface ArticleAttributes {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
  published_at: Date;
  author_id: number;
  totalViews: number;
}

interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id' | 'published_at'> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public thumbnail?: string;
  public published_at!: Date;
  public author_id!: number;
  public totalViews!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define the association with Genre
  public static associations: {
    genres: Association<Article, Genre>;
  };
    Genres: any;
}
// Function to initialize the model
const initArticleModel = (sequelize: Sequelize) => {
  Article.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Must reference the correct table name
        key: 'id',
      },
    },
    totalViews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Article',
    tableName: 'Articles', // Explicitly define the table name
    timestamps: true,
  });

  return Article;
};


export { Article, ArticleAttributes, ArticleCreationAttributes };
export default initArticleModel;
