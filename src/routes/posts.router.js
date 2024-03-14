import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 날짜를 'YYYY-MM-DD' 형식으로 변환
const formatDate = (date) => date.toISOString().split('T')[0];

// 투표 등록 API
router.post('/posts', authMiddleware, async (req, res, next) => {
    const { title, content, startDate, endDate, multiVote, options } = req.body;
    const { id: userId } = req.user;

    try {
        if (
            !title ||
            !content ||
            !startDate ||
            !endDate ||
            !Array.isArray(options) ||
            options.length === 0 ||
            options.some((option) => !option.content)
        ) {
            return res.status(400).json({
                message: '필수데이터가 전송 되지 않았습니다.',
            });
        }
        // 게시물(투표)과 옵션을 데이터베이스에 생성
        const newPost = await prisma.posts.create({
            data: {
                title,
                content,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                multiVote,
                userId,
                options: {
                    create: options.map((option) => ({
                        content: option.content,
                    })),
                },
            },
            include: { options: true }, // 생성된 옵션 정보도 함께 반환
        });

        const response = {
            id: newPost.id,
            title: newPost.title,
            content: newPost.content,
            createdAt: formatDate(newPost.createdAt),
            startDate: formatDate(new Date(startDate)),
            endDate: formatDate(new Date(endDate)),
            multiVote: newPost.multiVote,
            userId: newPost.userId,
            options: newPost.options,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 투표 전체 조회 API
router.get('/posts', async (req, res, next) => {
    //const {Likes,Comments} = req.body
    const postList = await prisma.posts.findMany({
        select: {
            id: true,
            title: true,
            createdAt: true,
            //likeCount: true,
            //commentsCount: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const response = postList.map((post) => ({
        id: post.id,
        title: post.title,
        createdAt: formatDate(post.createdAt), // 각 게시물의 createdAt을 변환
        //likeCount: post.likeCount, // 필요하다면 이 부분을 활성화
        //commentsCount: post.commentsCount, // 필요하다면 이 부분을 활성화
    }));
    return res.status(200).json(response);
});

// 게시글 상세 조회 API
router.get('/posts/:postId', async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await prisma.posts.findFirst({
            where: { id: Number(postId) }, // postId를 숫자로 변환
            include: {
                // 'select' 대신 'include' 사용하여 관련 데이터 포함
                user: true, // 유저 정보 포함
                options: true, // 옵션 정보 포함
            },
        });

        // 단일 post 객체를 검사하여 존재하는 경우, 날짜 포맷 변경 및 응답 구성
        if (post) {
            const response = {
                id: post.id,
                title: post.title,
                content: post.content,
                startDate: formatDate(new Date(post.startDate)),
                endDate: formatDate(new Date(post.endDate)),
                multiVote: post.multiVote,
                user: post.user ? { nickname: post.user.nickname } : null, // 사용자 정보가 있으면 포함
                options: post.options,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({ message: '게시물을 찾지 못하였습니다.' });
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 게시글 수정 API
router.put('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { title, content, startDate, endDate, multiVote, updatedAt } = req.body;
        if (!postId || !title || !content) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });


        const formattedStartDate = new Date(startDate).toISOString();
        const formattedEndDate = new Date(endDate).toISOString();

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const updatedPost = await prisma.posts.update({
            data: {
                title: title,
                content: content,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
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
router.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
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
