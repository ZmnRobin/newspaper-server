import { Sequelize } from 'sequelize';
import dbConfig from '../config/dbConfig';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
  pool: dbConfig.pool,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

interface DbInterface {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  users?: any;
  articles?: any;
  comments?: any;
  genres?: any;
  visitors?: any;
  articleViews?: any;
}

const db: DbInterface = {
  Sequelize,
  sequelize,
};

// Import models
import initUserModel from './User';
import initArticleModel from './Article';
import initCommentModel from './Comment';
import initGenreModel from './Genre';
import { initVisitorModel } from './Visitor';
import { initArticleViewModel } from './ArticleView';

// Initialize models
db.users = initUserModel(sequelize);
db.articles = initArticleModel(sequelize);
db.comments = initCommentModel(sequelize);
db.genres = initGenreModel(sequelize);
db.visitors = initVisitorModel(sequelize);
db.articleViews = initArticleViewModel(sequelize);

// Define relationships after models are initialized
db.articles.belongsTo(db.users, { foreignKey: 'author_id' });
db.comments.belongsTo(db.users, { foreignKey: 'user_id' });
db.comments.belongsTo(db.articles, { foreignKey: 'article_id', onDelete: 'CASCADE' });
// Many-to-many relationship between Articles and Genres
db.articles.belongsToMany(db.genres, { through: 'ArticleGenres' ,foreignKey: 'article_id' });
db.genres.belongsToMany(db.articles, { through: 'ArticleGenres', foreignKey: 'genre_id' });

// Many-to-many relationship between Visitors and Articles
// Define relationships
db.visitors.hasMany(db.articleViews, { foreignKey: 'visitor_id' });
db.articleViews.belongsTo(db.visitors, { foreignKey: 'visitor_id' });
db.articles.hasMany(db.articleViews, { foreignKey: 'article_id' });
db.articleViews.belongsTo(db.articles, { foreignKey: 'article_id' });

export default db;