// articleRoute.ts
import express from "express";
import {
  createArticle,
  getArticles,
  getSingleArticle,
  deleteArticle,
  updateArticle,
  getRecommendations,
  getRelatedArticless
} from "../controllers/articleController";
import verifyToken from "../middlewares/authMiddleware";
import {
  createComment,
  deleteComment,
  getCommentsByArticle,
  updateComment,
} from "../controllers/commentController";
import upload from "../config/multerConfig";

export default function () {
  const router = express.Router();

  // Get articles (handles search, by genre, by author, related articles)
  router.get("/", getArticles);

  // Get a single article by ID
  router.get("/:id", getSingleArticle);

  // Create a new article (protected route) with single image upload
  router.post("/", verifyToken, upload.single("thumbnail"), createArticle);

  // Update an article (protected route) with single image upload
  router.put("/:id", verifyToken, upload.single("thumbnail"), updateArticle);

  // Delete an article (protected route)
  router.delete("/:id", verifyToken, deleteArticle);

  // recommended articles route
  router.get("/recommended/articles", getRecommendations);

  // related articles route
  router.get("/related/articles/:id", getRelatedArticless);

  // Comment routes (keep as they are)
  router.post("/:articleId/comments", verifyToken, createComment);
  router.get("/:articleId/comments", getCommentsByArticle);
  router.delete("/:articleId/comments/:commentId", verifyToken, deleteComment);
  router.put("/:articleId/comments/:commentId", verifyToken, updateComment);

  return router;
}