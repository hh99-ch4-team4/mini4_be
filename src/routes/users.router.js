import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import signUpSchema from '../utils/schemas/signupSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    const { error, value } = signUpSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details
            .map((detail) => {
                switch (detail.path[0]) {
                    case 'email':
                        return '이메일 형식이 올바르지 않습니다.';
                    case 'nickname':
                        return '닉네임 형식이 올바르지 않습니다.';
                    case 'password':
                        return '비밀번호 형식이 올바르지 않습니다.';
                    default:
                        return '데이터 형식이 올바르지 않습니다.';
                }
            })
            .join('\n');

        return res.status(400).json({ message: errorMessage });
    }

    const { email, nickname, password } = value;

    // 이메일 중복 확인
    const existingUserByEmail = await prisma.users.findFirst({
        where: {
            email: email,
        },
    });

    if (existingUserByEmail) {
        return res.status(409).json({ message: '이미 사용중인 이메일 주소입니다.' });
    }

    // 닉네임 중복 확인
    const existingUserByNickname = await prisma.users.findFirst({
        where: {
            nickname: nickname,
        },
    });

    if (existingUserByNickname) {
        return res.status(409).json({ message: '이미 사용중인 닉네임입니다.' });
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

// 로그인 API
router.post('/log-in', async (req, res, next) => {
    try {
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
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: '비밀번호가 올바르지 않습니다' });
        }

        // 토큰 생성
        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '38m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // 리프레시 토큰을 쿠키에 설정
        res.cookie(
            'refreshToken',
            `Bearer ${refreshToken}`
            // {
            //     domain: 'example.com',
            //     httpOnly: true, // JavaScript를 통한 접근 방지
            //     secure: true, // HTTPS를 통해서만 쿠키를 전송
            //     path: '/', // 이 경로와 하위 경로에서 쿠키가 전송됨
            //     expiresIn: new Date(Date.now() + 900000), // 쿠키 만료 시간 설정 예시
            // }
        );

        return res.status(200).json({
            message: '로그인에 성공하였습니다',
            accessToken: `Bearer ${accessToken}`,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
