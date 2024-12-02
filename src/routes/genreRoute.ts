import { Router } from 'express';
import { getAllGenres, createGenre, deleteGenre } from '../controllers/genreController';

const router = Router();

// Get all genres
router.get('/', getAllGenres);

// Create a new genre
router.post('/', createGenre);

// Delete a genre (optional)
router.delete('/:id', deleteGenre);

export default router;
