import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 댓글 생성
router.post('/posts/:postId/comments', authMiddleware, async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = res.locals.user.id;

        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        if (!content) return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });

        const comment = await prisma.comments.create({
            data: { content: content, postId: +postId, userId: +userId },
        });

        return res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

// 댓글 조회
router.get('/posts/:postId/comments', async (req, res, next) => {
    try {
        const { postId } = req.params;
        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const comments = await prisma.comments.findMany({
            where: { postId: +postId },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;
        const userId = res.locals.user.id;

        if (!postId || !commentId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const existingComment = await prisma.comments.findFirst({ where: { id: +commentId, userId: +userId } });
        if (!existingComment) return res.status(404).json({ message: '댓글이 존재하지 않거나 수정 권한이 없습니다.' });

        if (!content) return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });

        const comment = await prisma.comments.update({
            data: { content: content },
            where: { id: +commentId, userId: +userId },
        });
        return res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        const userId = res.locals.user.id;

        if (!postId || !commentId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const existingComment = await prisma.comments.findFirst({ where: { id: +commentId, userId: +userId } });
        if (!existingComment) return res.status(404).json({ message: '댓글이 존재하지 않거나 삭제 권한이 없습니다.' });

        await prisma.comments.delete({ where: { id: +commentId, userId: +userId } });

        return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

export default router;
