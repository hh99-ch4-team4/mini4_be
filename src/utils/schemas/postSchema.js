import Joi from 'joi';

// 게시글 작성 스키마
const postSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    startDate: Joi.date().iso(), // ISO 8601 날짜 형식으로 검증,
    endDate: Joi.date().iso(),
    options: Joi.array()
        .items(
            Joi.object({
                content: Joi.string().required(),
            })
        )
        .required(),
});

// 게시글 조회, 수정, 삭제 스키마
const postDetailSchema = Joi.object({
    postId: Joi.number().required(),
});

// 투표 스키마
const voteSchema = Joi.object({
    postId: Joi.number().required(),
    optionId: Joi.number().required(),
});

export default [postSchema, postDetailSchema, voteSchema];
