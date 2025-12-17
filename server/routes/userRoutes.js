import express from 'express';
import { signup, login, checkAuth, updateProfile} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

// Route to signup a new user
userRouter.post('/signup', signup);
// Route to login a user
userRouter.post('/login', login);
// update profile route
userRouter.put('/update-profile', protectRoute, updateProfile);
// Route to check user authentication status
userRouter.get('/check', protectRoute, checkAuth);

export default userRouter;