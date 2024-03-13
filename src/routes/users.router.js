import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import signUpSchema from '../utils/schemas/signupSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {

    const{error, value} = signUpSchema.validate(req.body, { abortEarly: true }); 
    if (error) {
        const errorMessage = error.details.map(detail => {
            switch (detail.context.key) {
                case 'email':
                    return '이메일 형식이 올바르지 않습니다.';
                case 'nickname':
                    return '닉네임 형식이 올바르지 않습니다.';
                case 'password':
                    return '비밀번호 형식이 올바르지 않습니다.';
                default:
                    return '데이터 형식이 올바르지 않습니다.';
            }
        }).join('\n');

        return res.status(400).json({ message: errorMessage });
    }

    const { email, nickname, password } = value;

    const existingUser = await prisma.users.findFirst({
        where: {
            email: email
        }
    });

    if (existingUser) {
        return res.status(409).json({ message: '이미 사용중인 이메일 주소입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
        data: {
            email,
            nickname,
            password: hashedPassword,
        },
    });

    return res.status(201).json({ user });
});

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
// 로그인 API

router.post('/log-in', async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
    }
    const user = await prisma.users.findFirst({
        where: { email },
    });
    if (!user) {
        return res.status(400).json({ message: '존재하지 않는 이메일입니다' });
    }
    if (!(await bcrypt.compare(password, user.password))){
        return res.status(401).json({message : '비밀번호가 올바르지 않습니다'})
    }
    const accessToken = jwt.sign({id : user.id}, accessTokenSecret, { expiresIn: '38m' });

    res.cookie('authorization', `Bearer ${accessToken}`)
    
    return res.status(200).json({message: '로그인에 성공하였습니다'})
});

export default router;
