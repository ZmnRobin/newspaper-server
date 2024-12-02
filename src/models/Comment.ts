import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface CommentAttributes {
  id: number;
  content: string;
  user_id: number;
  article_id: number;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, "id"> {}

class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: number;
  public content!: string;
  public user_id!: number;
  public article_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const initCommentModel = (sequelize: Sequelize) => {
  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Must reference the correct table name
          key: "id",
        },
      },
      article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Articles", // Must reference the correct table name
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "Comments", // Explicitly define the table name
      timestamps: true,
    }
  );

  return Comment;
};

export default initCommentModel;
