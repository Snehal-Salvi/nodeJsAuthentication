// user.routes.js

import express from 'express';
import UserController from '../controllers/user.controller.js';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/', userController.getIndexView);

// Render registration page
userRouter.get('/register', userController.getRegistrationPage);

// Render login page
userRouter.get('/login', userController.getLoginPage);

// Handle user registration
userRouter.post('/register', userController.signup);

// Handle user login
userRouter.post('/login', userController.signin);

// Handle user logout
userRouter.get('/logout', userController.logout);

// Render reset password form
userRouter.get('/reset-password', userController.getResetPasswordPage);

// Handle password reset request
userRouter.post('/reset-password', userController.resetPasswordRequest);

// Render password reset page with token
userRouter.get('/reset-password/:token', userController.getResetPasswordWithTokenPage);

// Handle password reset with token
userRouter.post('/reset-password/:token', userController.postResetPasswordWithToken);

export default userRouter;
