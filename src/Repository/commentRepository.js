import { prisma } from '../utils/prisma/index.js'; // prisma 인스턴스 임포트

// 댓글이 작성된 게시글 찾기
export const checkPostExists = async ({ id }) => {
    const post = await prisma.posts.findFirst({ where: { id } });

    return Boolean(post);
};

// 댓글 작성
export const createComment = async ({ postId, userId, content }) => {
    return await prisma.comments.create({
        data: { content, postId, userId },
    });
};

// 댓글 조회
export const readComment = async ({ postId }) => {
    return await prisma.comments.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { nickname: true } },
        },
    });
};

// 이미 작성된 댓글 찾기
export const checkCommentExists = async ({ id }) => {
    return await prisma.comments.findFirst({ where: { id } });
};

// 댓글 수정
export const updateComment = async ({ postId, commentId, userId, content }) => {
    return await prisma.comments.update({
        data: { content: content },
        where: { postId: +postId, id: +commentId, userId: +userId },
    });
};

// 댓글 삭제
export const deleteComment = async ({ postId, commentId, userId }) => {
    return await prisma.comments.delete({ where: { postId: +postId, id: +commentId, userId: +userId } });
};
