import * as CommentRepository from '../Repository/commentRepository.js';
import { prisma } from '../utils/prisma/index.js'; // prisma 인스턴스 임포트가 필요합니다.

// 댓글 작성
export const createComment = async ({ postId, userId, content }) => {
    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

    if (!content) return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });

    return await CommentRepository.createComment({ postId: Number(postId), userId: Number(userId), content });
};

// 댓글 조회
export const readComment = async ({ postId }) => {
    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

    const comments = await CommentRepository.readComment({ postId });

    return comments.map((comment) => ({
        ...comment,
        nickname: comment.user.nickname,
    }));
};

// 댓글 수정
export const updateComment = async ({ postId, commentId, userId, content }) => {
    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

    const existingComment = await prisma.comments.findFirst({ where: { id: +commentId } });
    if (!existingComment) {
        return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    } else if (existingComment.userId !== userId) {
        return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
    }

    if (!content) return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });

    return await CommentRepository.updateComment({ postId, commentId, userId, content });
};

// 댓글 삭제
export const deleteComment = async ({ postId, commentId, userId }) => {
    const post = await prisma.posts.findFirst({ where: { id: +postId } });
    if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

    const existingComment = await prisma.comments.findFirst({ where: { id: +commentId } });
    if (!existingComment) {
        return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    } else if (existingComment.userId !== userId) {
        return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
    }

    return await CommentRepository.deleteComment({ postId, commentId, userId });
};
