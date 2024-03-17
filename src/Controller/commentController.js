import * as CommentService from '../Services/commentService.js';
import schemas from '../utils/schemas/commentSchema.js';

const [commentSchema, commentDetailSchema] = schemas;

// 댓글 작성
export const createCommentController = async (req, res, next) => {
    try {
        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = commentSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId } = value;

        const userId = res.locals.user.id;
        const { content } = req.body;

        const comment = await CommentService.createComment({ postId, userId, content });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 댓글 조회
export const readCommentController = async (req, res, next) => {
    try {
        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = commentSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId } = value;

        const comment = await CommentService.readComment({ postId: +postId });

        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 댓글 수정
export const updateCommentController = async (req, res, next) => {
    try {
        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = commentDetailSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId, commentId } = value;

        const userId = res.locals.user.id;
        const { content } = req.body;

        const comment = await CommentService.updateComment({ postId, commentId, userId, content });

        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 댓글 삭제
export const deleteCommentController = async (req, res, next) => {
    try {
        // 스키마를 사용하여 요청 본문 검증
        const { error, value } = commentDetailSchema.validate(req.params, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
        const { postId, commentId } = value;

        const userId = res.locals.user.id;

        await CommentService.deleteComment({ postId, commentId, userId });

        res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
