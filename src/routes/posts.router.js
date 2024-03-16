import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import schemas from '../utils/schemas/postSchema.js';

const [postSchema, postDetailSchema, voteSchema] = schemas;

const router = express.Router();

// 투표 등록 API (완)
router.post('/posts', authMiddleware, async (req, res, next) => {
    const userId = res.locals.user.id;

    // 스키마를 사용하여 요청 본문 검증
    const { error, value } = postSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
    const { title, content, startDate, endDate, options } = value;

    try {
        // 게시물(투표)과 옵션을 데이터베이스에 생성
        const newPost = await prisma.posts.create({
            data: {
                title,
                content,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
                options: {
                    create: options.map((option) => ({
                        content: option.content,
                    })),
                },
            },
            include: { options: true }, // 생성된 옵션 정보도 함께 반환
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 투표 전체 조회 API (완)
router.get('/posts', async (req, res, next) => {
    //const {Likes,Comments} = req.body
    const postList = await prisma.posts.findMany({
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const response = postList.map((post) => ({
        id: post.id,
        title: post.title,
        startDate: post.startDate,
        endDate: post.endDate,
    }));
    return res.status(200).json(response);
});

// 투표 상세 조회 API (완)
router.get('/posts/:postId', authMiddleware, async (req, res, next) => {
    const { id: userId } = res.locals.user; // 사용자 인증 미들웨어를 통해 얻은 사용자 ID

    // 스키마를 사용하여 요청 본문 검증
    const { error, value } = postDetailSchema.validate(req.params, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
    const { postId } = value;

    try {
        const post = await prisma.posts.findUnique({
            where: { id: Number(postId) },
            include: {
                user: true, // 투표 생성자 정보
                options: {
                    include: {
                        voteHistory: true, // 현재 사용자의 투표 기록 전체를 포함
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ message: '투표를 찾을 수 없습니다.' });
        }

        const response = {
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            startDate: post.startDate,
            endDate: post.endDate,
            user: post.user ? { nickname: post.user.nickname } : null,
            userId: post.userId,
            options: post.options.map((option) => ({
                id: option.id,
                content: option.content,
                count: option.count,
                voteHistory: option.voteHistory, // 전체 투표 기록 포함 (선택적)
            })),
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 사용자 투표 처리 API (완)
router.post('/vote/:postId', authMiddleware, async (req, res) => {
    const { id: userId } = res.locals.user;

    // req.params와 req.body를 병합
    const validationData = {
        ...req.params,
        ...req.body,
    };
    // 스키마를 사용하여 병합된 데이터 검증
    const { error } = voteSchema.validate(validationData, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
    // 검증 후의 데이터 사용
    const { postId, optionId } = validationData;

    try {
        // 투표 및 옵션 존재 여부, 중복 투표 방지, 투표 가능 기간 확인 등의 로직 추가
        // ..
        // 선택한 투표(Post)와 옵션(Option)의 유효성 검사
        const post = await prisma.posts.findUnique({
            where: { id: parseInt(postId) },
            include: { options: true },
        });

        if (!post) {
            return res.status(404).json({ message: '존재하지않는 게시물 입니다.' });
        }

        const option = post.options.find((o) => o.id === parseInt(optionId));
        if (!option) {
            return res.status(404).json({ message: '옵션을 찾을 수 없습니다.' });
        }

        // 투표 기간 검사
        const now = new Date();
        if (now < post.startDate || now > post.endDate) {
            return res.status(400).json({ message: '투표 기간이 아닙니다.' });
        }

        // 중복 투표 검사
        const voteHistory = await prisma.voteHistory.findFirst({
            where: {
                userId,
                option: {
                    postId: parseInt(postId),
                },
            },
        });

        if (voteHistory) {
            return res.status(400).json({ message: '이미 이 투표에 참여하셨습니다.' });
        }

        // 투표 기록 및 옵션 count 증가
        await prisma.$transaction(async (prisma) => {
            await prisma.voteHistory.create({
                data: {
                    userId,
                    optionId,
                },
            });

            await prisma.options.update({
                where: { id: optionId },
                data: { count: { increment: 1 } },
            });
        });

        res.status(201).json({ message: '투표가 성공적으로 완료되었습니다.' });
    } catch (error) {
        console.error('Error during voting:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 투표 수정 API
router.patch('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        const { title, content, startDate, endDate, options } = req.body;

        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = postDetailSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId } = value;

        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const updatedPostWithOptions = await prisma.$transaction(async (prisma) => {
            const post = await prisma.posts.findFirst({ where: { id: +postId } });

            if (!post) {
                throw new Error('존재하지 않는 게시글입니다.');
            }

            const now = new Date();
            const postStartDate = new Date(post.startDate);
            if (now.getTime() > postStartDate.getTime()) {
                throw new Error('수정할 수 있는 기간이 아닙니다.');
            }

            // 게시글 업데이트
            const updatedPost = await prisma.posts.update({
                where: { id: +postId },
                data: {
                    ...(title && { title }),
                    ...(content && { content }),
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                    updatedAt: new Date(),
                },
            });

            // 옵션 업데이트 및 추가
            const updatedOptions = await Promise.all(
                options.map(async (option) => {
                    if (option.id) {
                        // 기존 옵션 업데이트
                        return prisma.options.update({
                            where: { id: option.id },
                            data: { content: option.content },
                        });
                    } else {
                        // 새 옵션 추가
                        return prisma.options.create({
                            data: {
                                content: option.content,
                                postId: +postId,
                            },
                        });
                    }
                })
            );

            return { updatedPost, updatedOptions };
        });

        return res.status(200).json({ ...updatedPostWithOptions, message: '게시글과 옵션이 수정되었습니다.' });
    } catch (error) {
        console.error(error);
        if (error.message === '존재하지 않는 게시글입니다.') {
            return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });
        }

        if (error.message === '수정할 수 있는 기간이 아닙니다.') {
            return res.status(400).json({ message: '수정할 수 있는 기간이 아닙니다.' });
        }
        next(error);
    }
});

// 투표삭제 API
router.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = postDetailSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId } = value;

        const { id: userId } = res.locals.user;

        const post = await prisma.posts.findFirst({ where: { id: +postId } });
        if (!post) {
            return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });
        } else if (post.userId !== +userId) {
            return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });
        }

        await prisma.posts.delete({ where: { id: +postId } });

        return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
