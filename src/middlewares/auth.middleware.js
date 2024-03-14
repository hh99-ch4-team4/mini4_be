import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function (req, res, next) {
    try {
        // 1. 클라이언트로부터 쿠키를 전달받는다
        const { authorization } = req.cookies;
        console.log('🎟️🎟️🎟️액세스토큰 : ' + authorization);

        // 쿠키가 존재하지 않으면, 인증된 사용자가 아님
        if (!authorization) return res.status(401).json({ message: '로그인이 필요한 서비스입니다' });

        // 인증 정보가 있는 경우, 엑세스 토큰과 리프레시 토큰을 추출
        const [bearer, accessTokenPayload] = authorization.split(' ');

        // // 만약 토큰 타입이 Bearer가 아닐때 오류
        if (bearer !== 'Bearer') return res.status(401).json({ message: '토큰 타입이 Bearer 형식이 아닙니다' });

        // 엑세스 토큰을 확인하고 사용자 ID를 추출
        let decodedAccessToken;
        try {
            // JWT를 사용하여 서버에서 발급한 토큰이 유효한지 검증
            decodedAccessToken = jwt.verify(accessTokenPayload, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            // 엑세스 토큰이 만료된 경우, 리프레시 토큰을 확인하고 새로운 엑세스 토큰을 발급
            if (error.name === 'TokenExpiredError') {
                // 리프레시 토큰 검증

                const { refreshToken } = req.cookies;
                if (!refreshToken) return res.status(401).json({ message: 'refresh토큰이 존재하지 않습니다' });

                const [bearer, refreshTokenPayload] = refreshToken.split(' ');
                if (bearer !== 'Bearer') return res.status(401).json({ message: '토큰 타입이 Bearer 형식이 아닙니다' });

                const decodedRefreshToken = jwt.verify(refreshTokenPayload, process.env.REFRESH_TOKEN_SECRET);

                // 새로운 액세스 토큰 발급
                const newAccessToken = jwt.sign({ id: decodedRefreshToken.id }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1d',
                });

                return res.status(200).json({
                    message: '새로운 accessToken이 재발급되었습니다',
                    accessToken: `Bearer ${newAccessToken}`,
                });

                // 클라이언트에게 새로운 액세스 토큰을 전달
                // res.cookie('accessToken', `Bearer ${newAccessToken}`);

                // 새로 발급한 액세스 토큰을 검증하여 사용자 조회
                decodedAccessToken = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN_SECRET);
            } else {
                throw error;
            }
        }

        const user = await prisma.users.findUnique({
            where: { id: +decodedAccessToken.id },
        });

        if (!user) {
            throw new Error('토큰 사용자가 존재하지 않습니다');
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
}

req.headers.authorization