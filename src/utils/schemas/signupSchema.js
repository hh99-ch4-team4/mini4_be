import Joi from 'joi';

const signUpSchema = Joi.object({
    email: Joi.string().email().required(),
    nickname: Joi.string().min(3).max(15).required(),
    password: Joi.string()
        .min(6)
        .max(20)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .message('비밀번호는 최소한 하나의 대문자, 소문자, 숫자를 포함해야 합니다.')
        .required(),
});

export default signUpSchema;
