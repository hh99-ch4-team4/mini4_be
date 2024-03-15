import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 날짜를 'YYYY-MM-DD' 형식으로 변환
const formatDate = (date) => {
    // 'date'가 Date 인스턴스이며 유효한 날짜인지 확인
    if (date instanceof Date && !isNaN(date)) {
        return date.toISOString().split('T')[0];
    } else {
        try {
            // 'date'로부터 Date 객체를 생성하고 유효성 검사
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate)) {
                return parsedDate.toISOString().split('T')[0];
            } else {
                throw new Error('유효하지 않은 날짜');
            }
        } catch (error) {
            console.error('formatDate 오류:', error);
            // 유효하지 않은 날짜 입력 처리
            // 예를 들어, null을 반환하거나 기본 날짜 문자열을 반환
            return null;
        }
    }
};

// 투표 등록 API (완)
router.post('/posts', authMiddleware, async (req, res, next) => {
    const { title, content, startDate, endDate, options } = req.body;
    const { id: userId } = res.locals.user;

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
            userId: newPost.userId,
            options: newPost.options,
        };

        res.status(201).json(response);
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
            //createdAt: true,
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
        startDate: formatDate(post.startDate),
        endDate: formatDate(post.endDate),
        //createdAt: formatDate(post.createdAt), // 각 게시물의 createdAt을 변환
        //likeCount: post.likeCount, // 필요하다면 이 부분을 활성화
        //commentsCount: post.commentsCount, // 필요하다면 이 부분을 활성화
    }));
    return res.status(200).json(response);
});

// 투표 상세 조회 API (완)
router.get('/posts/:postId', authMiddleware, async (req, res, next) => {
    const { postId } = req.params;
    const { id: userId } = res.locals.user; // 사용자 인증 미들웨어를 통해 얻은 사용자 ID

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
            createdAt: formatDate(post.createdAt),
            updatedAt: formatDate(post.updatedAt),
            startDate: formatDate(post.startDate),
            endDate: formatDate(post.endDate),
            user: post.user ? { nickname: post.user.nickname } : null,
            userId: userId,
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
    const { optionId } = req.body;
    const { postId } = req.params;
    const { id: userId } = res.locals.user;

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
        const { postId } = req.params;
        const { title, content, startDate, endDate, options } = req.body;
        const { id: userId } = res.locals.user;

        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId } });

        const now = new Date();
        const postStartDate = new Date(post.startDate);
        if (now > postStartDate) {
            return res.status(400).json({ message: '수정할수 있는 기간이 아닙니다.' });
        }

        // const catchStartDate = formatDate(startDate);
        // const catchEndDate = formatDate(endDate);

        if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

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

        // 기존 옵션들을 삭제
        await prisma.options.deleteMany({
            where: { postId: +postId },
        });

        if (options && Array.isArray(options)) {
            // 각 옵션을 데이터베이스에 추가
            for (const option of options) {
                await prisma.options.create({
                    data: {
                        content: option.content,
                        postId: +postId, // 새로운 옵션을 현재 게시글에 연결
                    },
                });
            }
        }

        return res.status(200).json(updatedPost, { message: '게시글을 수정하였습니다.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 게시글 삭제 API
router.delete('/posts/:postId', authMiddleware, async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { id: userId } = res.locals.user;

        if (!postId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const post = await prisma.posts.findFirst({ where: { id: +postId} });
        if (!post) {return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });
    }   else if(post.userId !== +userId){
        return res.status(403).json({message : '게시글을 삭제할 권한이 없습니다.'})
    }


        await prisma.posts.delete({ where: { id: +postId } });

        return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
