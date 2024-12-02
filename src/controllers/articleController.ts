// articleController.ts
import { Request, Response } from "express";
import db from "../models";
import { cloudinary } from "../config/cloudinaryConfig";
import { Op } from "sequelize";
import { trackArticleView, getRecommendedArticles, getRelatedArticles } from "../services/recommendationService";

const Article = db.articles;
const User = db.users;
const Genre = db.genres;

interface AuthRequest extends Request {
  user?: any;
}

export const getArticles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    page = 1,
    limit = 10,
    genreId,
    authorId,
    query,
    articleId,
  } = req.query;
  
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  try {
    const whereClause: any = {};
    
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (authorId) {
      whereClause.author_id = authorId;
    }

    const includeClause: any[] = [
      { model: User, attributes: ['id', 'name'] }
    ];

    if (genreId) {
      includeClause.push({
        model: Genre,
        where: { id: genreId },
        through: { attributes: [] }
      });
    } else {
      includeClause.push({ model: Genre });
    }

    if (articleId) {
      const currentArticle = await Article.findByPk(articleId, {
        include: [{ model: Genre }]
      });

      if (currentArticle) {
        const genreIds = currentArticle.Genres.map((genre: any) => genre.id);
        whereClause.id = { [Op.ne]: articleId };
        includeClause.push({
          model: Genre,
          where: { id: genreIds },
          through: { attributes: [] }
        });
      }
    }

    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: limitNumber,
      offset: offset,
      distinct: true,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({
      articles,
      currentPage: pageNumber,
      totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const userIp = req.ip;
  try {
    const article = await Article.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "name"] },
        { model: Genre }
      ]
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await trackArticleView(article.id, userIp || "");
    return res.status(200).json(article);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createArticle = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { title, content, genreIds } = req.body;
  const userId = req.user?.id;

  try {
    let thumbnail = null;
    if (req.file) {
      thumbnail = req.file.path;
    }

    const newArticle = await Article.create({
      title,
      content,
      thumbnail,
      author_id: userId,
    });

    if (genreIds) {
      let parsedGenreIds;
      try {
        // Handle both string and array inputs
        parsedGenreIds = typeof genreIds === 'string' 
          ? JSON.parse(genreIds.trim()) 
          : genreIds;

        const genres = await Genre.findAll({ 
          where: { id: parsedGenreIds } 
        });
        await newArticle.addGenres(genres);
      } catch (parseError) {
        console.error('Error parsing genreIds:', parseError);
        // Continue without genres if parsing fails
      }
    }

    const articleWithRelations = await Article.findByPk(newArticle.id, {
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Genre }
      ]
    });

    return res.status(201).json(articleWithRelations);
  } catch (error) {
    console.error('Error creating article:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: (error as Error).message 
    });
  }
};

export const updateArticle = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { title, content, genreIds } = req.body;
  const userId = req.user?.id;

  try {
    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.author_id !== userId)
      return res.status(403).json({ message: "Unauthorized to update this article" });

    let thumbnail = article.thumbnail;
    if (req.file) {
      // If there's an existing thumbnail, delete it from Cloudinary
      if (thumbnail) {
        const publicId = thumbnail.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`articles/${publicId}`);
        }
      }
      thumbnail = req.file.path; // New Cloudinary URL
    }

    await article.update({
      title,
      content,
      thumbnail
    });

    if (genreIds) {
      let parsedGenreIds;
      try {
        // Handle both string and array inputs
        parsedGenreIds = typeof genreIds === 'string' 
          ? JSON.parse(genreIds.trim()) 
          : genreIds;

        const genres = await Genre.findAll({ 
          where: { id: parsedGenreIds } 
        });
        await article.setGenres(genres);

      } catch (parseError) {
        console.error('Error parsing genreIds:', parseError);
        // Continue without genres if parsing fails
      }
    }


    const updatedArticle = await Article.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Genre }
      ]
    });

    return res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: (error as Error).message 
    });
  }
};

export const deleteArticle = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.author_id !== userId)
      return res.status(403).json({ message: "Unauthorized to delete this article" });

    await article.destroy();
    return res.status(204).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecommendations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { limit = 10, page = 1, articleId } = req.query;
  const pageSize = Number(limit);
  const currentPage = Number(page);

  try {
    const { articles, total } = await getRecommendedArticles(
      pageSize,
      currentPage,
      articleId ? Number(articleId) : undefined
    );

    const totalPages = Math.ceil(total / pageSize);

    return res.status(200).json({
      articles,
      pagination: {
        currentPage,
        totalPages,
        pageSize,
        totalItems: total
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRelatedArticless = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  try {
    const relatedArticles = await getRelatedArticles(
      Number(id),
      Number(limit)
    );

    return res.status(200).json(relatedArticles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
