import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { likeController } from '../Controller/likeController.js';

const router = express.Router();

// 좋아요 API
router.post('/posts/:postId/likes', authMiddleware, likeController);

export default router;
