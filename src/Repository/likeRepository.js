import { prisma } from '../utils/prisma/index.js'; // prisma 인스턴스 임포트

export const checkPostExists = async (postId) => {
    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    return Boolean(post);
};

export const findLike = async (postId, userId) => {
    return prisma.likes.findFirst({
        where: { postId: +postId, userId: +userId },
    });
};

export const toggleLike = async (likeId, likeCheck) => {
    return prisma.likes.update({
        where: { id: likeId },
        data: { likeCheck },
    });
};

export const createLike = async (postId, userId) => {
    return prisma.likes.create({
        data: { postId: +postId, userId: +userId, likeCheck: true },
    });
};

export const countLikes = async (postId) => {
    return prisma.likes.count({
        where: { postId: +postId, likeCheck: true },
    });
};
