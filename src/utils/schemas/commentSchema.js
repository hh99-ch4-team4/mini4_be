import Joi from 'joi';

// 댓글 조회 스키마
const commentSchema = Joi.object({
    postId: Joi.number().required(),
});

//댓글 수정 스키마
const commentDetailSchema = Joi.object({
    postId: Joi.number().required(),
    commentId: Joi.number().required(),
});

export default [commentSchema, commentDetailSchema];
