// models/ArticleView.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

interface ArticleViewAttributes {
  id: number;
  visitor_id: number;
  article_id: number;
  views: number;
  unique_views: number;
}

export class ArticleView extends Model<ArticleViewAttributes> implements ArticleViewAttributes {
  public id!: number;
  public visitor_id!: number;
  public article_id!: number;
  public views!: number;
  public unique_views!: number;
}

export const initArticleViewModel = (sequelize: Sequelize) => {
  ArticleView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      visitor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      unique_views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'ArticleView',
      tableName: 'ArticleViews',
    }
  );
  return ArticleView;
};
