import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 좋아요 등록 API
router.post('/posts/:postId/likes', async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!paramId || !userId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

    const like = await prisma.likes.findFirst({
        where: { postId: +postId, userId: +userId },
    });

    // 좋아요 있으면, 이미 누른 좋아요에 대한 메세지 반환.
    if (like) {
        return res.status(409).json({ message: '이미 좋아요를 눌렀습니다.' });
    }

    // 좋아요 추가
    await prisma.likes.create({ data: { postId: +postId, userId: +userId } });

    return res.status(200).json({ message: '좋아요가 등록되었습니다.' });
});

// 좋아요 삭제 API
router.delete('/posts/:postId/likes', async (req, res, next) => {
    const { postId, userId } = req.params;
    if (!paramId || !userId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

    const like = await prisma.likes.findFirst({ where: { postId: +postId, userId: +userId } });

    // 좋아요 없으면, 좋아요가 없다는 메세지 반환.
    if (!like) {
        return res.status(409).json({ message: '좋아요가 등록되어 있지 않습니다.' });
    }

    // 좋아요 삭제
    await prisma.likes.delete({ where: { id: like.id } });

    return res.status(200).json({ message: '좋아요가 취소되었습니다.' });
});

export default router;
