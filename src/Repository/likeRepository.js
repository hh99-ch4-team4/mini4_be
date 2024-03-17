import { prisma } from '../utils/prisma/index.js'; // prisma 인스턴스 임포트

// 게시글 존재하는지 확인
export const checkPostExists = async ({ id }) => {
    const post = await prisma.posts.findFirst({ where: { id } });
    return Boolean(post);
};

// 좋아요 했는지 안했는지 확인
export const findLike = async (postId, userId) => {
    return await prisma.likes.findFirst({
        where: { postId: +postId, userId: +userId },
    });
};

// 좋아요를 두 번 이상 누른 사람의 좋아요 상태 변환
export const toggleLike = async (likeId, likeCheck) => {
    return await prisma.likes.update({
        where: { id: likeId },
        data: { likeCheck },
    });
};

// 좋아요 처음 누른 사람의 좋아요 등록
export const createLike = async ({ postId, userId }) => {
    return await prisma.likes.create({
        data: { postId: +postId, userId: +userId, likeCheck: true },
    });
};

// 좋아요 수 count
export const countLikes = async (postId) => {
    return await prisma.likes.count({
        where: { postId: +postId, likeCheck: true },
    });
};
