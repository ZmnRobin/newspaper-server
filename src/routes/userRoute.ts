import express from 'express';
import userController from '../controllers/userController';
import userAuth from '../middlewares/userAuth';

const { signup, login } = userController;

const router = express.Router();

// Signup and login routes
router.post('/signup', userAuth.saveUser, signup);
router.post('/login', login);

export default router;
