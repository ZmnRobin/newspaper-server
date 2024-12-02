import { Request, Response, NextFunction } from 'express';
import db from '../models';

const User = db.users;

// Function to check if username or email already exist in the database
// this is to avoid having two users with the same username and email
const saveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Search the database to see if the username exists
    const username = await User.findOne({
      where: {
        name: req.body.name,
      },
    });

    // If username exists in the database, respond with a status of 409
    if (username) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Check if the email already exists
    const emailCheck = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    // If email exists in the database, respond with a status of 409
    if (emailCheck) {
      return res.status(409).json({ message: 'Authentication failed, email already in use' });
    }

    // If no conflict, proceed to the next middleware
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Exporting module
export default { saveUser };
