import express from 'express';
import { register, login, resetPassword, forgotPassword, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authLimiter, registerLimiter, resetLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../middlewares/validate.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', resetLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/logout', authMiddleware, logout);

export default router;
