import * as LikeService from '../Services/likeService.js';

export const likeController = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const userId = res.locals.user.id;

        if (!postId || !userId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

        const { message, likeCount } = await LikeService.likeComment(postId, userId);

        return res.status(201).json({ message, likeCount });
    } catch (error) {
        console.error(error);
        // next(error);
    }
};
