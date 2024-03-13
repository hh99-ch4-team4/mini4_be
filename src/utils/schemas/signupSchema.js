import Joi from 'joi';

const signUpSchema = Joi.object({
    userName : Joi.string().min(3).max(15).alphanum().required(), 
    nickname: Joi.string().min(3).max(15).required(), 
    password: Joi.string() 
        .min(6)
        .max(20)
        .required(),
});

export default signUpSchema;