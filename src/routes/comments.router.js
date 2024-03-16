import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import schemas from '../utils/schemas/commentSchema.js';

const [commentSchema, commentDetailSchema] = schemas;

const router = express.Router();

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const { content } = req.body;

        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = commentSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId } = value;

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        if (!content) return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });

        const comment = await prisma.comments.create({
            data: { content: content, postId: +postId, userId: +userId },
        });

        return res.status(201).json(comment);
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
            include: {
                user: {
                    select: {
                        nickname: true, // 사용자 닉네임 포함
                    },
                },
            },
        });

        const commentsWithUser = comments.map((comment) => ({
            ...comment,
            nickname: comment.user.nickname, // 닉네임 직접 추가
            user: undefined, // 기존 user 객체 제거
        }));

        return res.status(200).json(commentsWithUser);
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { content } = req.body;
        const userId = res.locals.user.id;

        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = commentDetailSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId, commentId } = value;

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const existingComment = await prisma.comments.findFirst({ where: { id: +commentId } });
        if (!existingComment) {
            return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
        } else if (existingComment.userId !== userId) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

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
        const { error, value } = commentDetailSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId, commentId } = value;

        const userId = res.locals.user.id;

        // if (!postId || !commentId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

        const existingComment = await prisma.comments.findFirst({ where: { id: +commentId } });
        if (!existingComment) {
            return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
        } else if (existingComment.userId !== userId) {
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }

        await prisma.comments.delete({ where: { id: +commentId, userId: +userId } });

        return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        // next(error);
    }
});

export default router;
