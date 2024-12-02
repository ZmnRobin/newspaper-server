import { Op } from 'sequelize';
import db from '../models';

export const getRecommendedArticles = async (
  limit: number,
  page: number,
  excludeArticleId?: number
): Promise<{ articles: any[], total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const whereClause: any = {};
    
    if (excludeArticleId) {
      whereClause.id = { [Op.ne]: excludeArticleId };
    }

    const { count, rows: articles } = await db.articles.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.users, attributes: ['id', 'name'] },
        { model: db.genres }
      ],
      order: [
        ['totalViews', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset,
      distinct: true
    });

    return { articles, total: count };
  } catch (error) {
    console.error('Error getting recommended articles:', error);
    return { articles: [], total: 0 };
  }
};

export const getRelatedArticles = async (
  articleId: number,
  limit: number = 5
): Promise<any[]> => {
  try {
    // Get the current article with its genres
    const currentArticle = await db.articles.findByPk(articleId, {
      include: [{ model: db.genres }]
    });

    if (!currentArticle) {
      return [];
    }

    // Get genre IDs of current article
    const genreIds = currentArticle.Genres.map((genre: any) => genre.id);

    // Find articles that share at least one genre
    const relatedArticles = await db.articles.findAll({
      where: {
        id: { [Op.ne]: articleId } // Exclude current article
      },
      include: [
        { model: db.users, attributes: ['id', 'name'] },
        {
          model: db.genres,
          where: { id: genreIds },
          through: { attributes: [] }
        }
      ],
      order: [
        ['totalViews', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      distinct: true
    });

    return relatedArticles;
  } catch (error) {
    console.error('Error getting related articles:', error);
    return [];
  }
};

export const trackArticleView = async (articleId: number, userIp: string) => {
  try {
    await db.articles.increment('totalViews', {
      by: 1,
      where: { id: articleId }
    });
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
};