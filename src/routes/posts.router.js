import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = express.Router();

// 게시글 등록 API
router.post('/posts', authMiddleware, async (req, res, next) => {
    const { title, content, startDate, endDate, multiVote} = req.body;
    const { id: userId } = req.user;
// 

    const newPost = await prisma.posts.create({
        data: {
            title,
            content,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            multiVote,
            userId,
        },
    });
    return res.status(201).json({ newPost, message: '카테고리를 등록하였습니다.' });
});

// 게시글 전체 조회 API
router.get('/posts', async (req, res, next) => {
    const postList = await prisma.posts.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            startDate: true,
            endDate: true,
            multiVote: true,
            likeCount: true,
            commentsCount: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return res.status(200).json({ data: postList });
});

// 게시글 상세 조회 API
router.get('/posts/:postId', async (req, res, next) => {
    const { postId } = req.params;

    const post = await prisma.posts.findFirst({
        where: { id: parseInt(postId) },
        select: {
            id: true,
            title: true,
            content: true,
            startDate: true,
            endDate: true,
            multiVote: true,
            user: {
                select: {
                    userName: true,
                    nickname: true
                }
            }
        },
    });
    return res.status(200).json({ post });
});

// 게시글 수정 API
router.put('/posts/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { title, content, startDate, endDate, multiVote, updatedAt } = req.body;
        if (!postId || !title || !content) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const updatedPost = await prisma.posts.update({
            data: {
                title: title,
                content: content,
                startDate: startDate,
                endDate: endDate,
                multiVote: multiVote,
                updatedAt: updatedAt,
            },
            where: { id: +postId },
        });

        return res.status(200).json({ data: updatedPost, message: '게시글을 수정하였습니다.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 게시글 삭제 API
router.delete('/posts/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params;
        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        await prisma.posts.delete({ where: { id: +postId } });

        return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
