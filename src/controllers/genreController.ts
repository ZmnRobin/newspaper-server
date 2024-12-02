import { Request, Response } from 'express';
import db from '../models';

const Genre = db.genres;

// Get all genres
export const getAllGenres = async (req: Request, res: Response): Promise<Response> => {
  try {
    const genres = await Genre.findAll();
    return res.status(200).json(genres);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new genre
export const createGenre = async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.body;

  try {
    // Check if genre already exists
    const existingGenre = await Genre.findOne({ where: { name } });
    if (existingGenre) {
      return res.status(400).json({ message: 'Genre already exists' });
    }
    // Create the new genre
    const newGenre = await Genre.create({ name });
    return res.status(201).json(newGenre);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a genre (optional, admin feature)
export const deleteGenre = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    await genre.destroy();
    return res.status(204).json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
