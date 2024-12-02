import { Request, Response } from 'express';
import db from '../models';

const Comment = db.comments;
const Article = db.articles;
const User = db.users;

interface AuthRequest extends Request {
    user?: any;
}

// Create a new comment (JWT protected)
export const createComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // Extract user id from JWT middleware

  try {
    // Find the article by its ID
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Create a new comment
    const newComment = await Comment.create({
      content,
      user_id: userId,
      article_id: articleId,
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all comments for a specific article
export const getCommentsByArticle = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;

  // Find all comments for the article in descending order
  try {
    const comments = await Comment.findAll({
      where: {
        article_id: articleId
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a comment by it's owner (JWT protected)
export const deleteComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { articleId, commentId } = req.params;
  const userId = req.user.id;

  try {
    // Find the comment by its ID and article ID
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        article_id: articleId
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the owner of the comment
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete the comment
    await comment.destroy();

    return res.status(204).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Internal server error'});
  }
};

// Update a comment by it's owner (JWT protected)
export const updateComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { articleId, commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Find the comment by its ID and article ID
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        article_id: articleId
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the owner of the comment
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the comment
    comment.content = content;
    await comment.save();

    return res.status(200).json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ message: 'Internal server error'});
  }
};
