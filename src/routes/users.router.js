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
        const accessToken = jwt.sign({ id: user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '38m' });
        const refreshToken = jwt.sign({ id: user.id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // 리프레시 토큰을 쿠키에 설정 >> HTTPS 적용후 쿠키로 바꾸기 
        // res.cookie('refreshToken', `Bearer ${refreshToken}`);
        // res.cookie('accessToken', `Bearer ${accessToken}`);

        return res.status(200).json({
            message: '로그인에 성공하였습니다',
            accessToken: `Bearer ${accessToken}`, 
            refreshToken: `Bearer ${refreshToken}`
        });
    } catch (error) {
        next(error);
    }
});

// Refresh토큰으로 AccessToken 재발급 받기 API
router.post('/refresh', async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({ message: 'Refresh Token을 전달받지 못했습니다.' });

    // 인증 정보가 있는 경우, 리프레시 토큰을 추출
    const [bearer, refreshToken] = authorization.split(' ');
    // // 만약 토큰 타입이 Bearer가 아닐때 오류 메세지
    if (bearer !== 'Bearer') return res.status(401).json({ message: '토큰 타입이 Bearer 형식이 아닙니다' });

    // 리프레시 토큰을 확인하고 사용자 ID를 추출
    let decodedRefreshToken;
    try {
        // JWT를 사용하여 서버에서 발급한 토큰이 유효한지 검증
        decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // 토큰 생성 
        const accessToken = jwt.sign({ id: decodedRefreshToken.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '38m' });
        const newRefreshToken = jwt.sign({ id: decodedRefreshToken.id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        return res.status(201).json({
            accessToken: `Bearer ${accessToken}`,
            refreshToken: `Bearer ${newRefreshToken}`,
        });
    } catch (error) {
        // 리프레시 토큰이 만료된 경우, 로그인 창으로 리다이렉트
        if (error.name === 'TokenExpiredError') {
            // return res.redirect('service.com/login'); // 나중에 frontend 주소로 변경하기
            return res.status(200).json({ message: 'refresh token이 만료되었습니다 = 성공!' });
        } else {
            throw error;
        }
    }
});

export default router;
