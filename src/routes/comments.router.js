import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';

import {
    createCommentController,
    readCommentController,
    updateCommentController,
    deleteCommentController,
} from '../Controller/commentController.js';

let router = express.Router();

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, createCommentController);

// 댓글 조회
router.get('/posts/:postId/comments', readCommentController);

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, updateCommentController);

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteCommentController);

export default router;
