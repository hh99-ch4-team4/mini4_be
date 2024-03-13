import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 댓글 생성
router.post('/posts/:postId/comments', async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const comment = await prisma.comments.create({
            data: { content: content, postId: +postId },
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

        const comments = await prisma.comments.findMany({ where: { postId: +postId } });

        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;

        if (!postId || !commentId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const comment = await prisma.comments.update({
            data: { content: content },
            where: { id: +commentId },
        });
        return res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        if (!postId || !commentId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        await prisma.comments.delete({ where: { id: +commentId } });

        return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

export default router;
