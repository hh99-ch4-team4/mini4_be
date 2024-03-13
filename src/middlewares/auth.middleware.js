import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

//
export default async function (req, res, next) {
    try {
        const {authorization} = req.cookies;
        if(!authorization)
        throw new Error('로그인이 필요한 서비스입니다');

        const [tokenType, accessToken] = authorization.split(" ");
        // 만약 토큰 타입이 Bearer가 아닐때 오류
        if (tokenType !== 'Bearer')
            throw new Error('토큰 타입이 Bearer 형식이 아닙니다');
            
            let decodedToken;
            try {
                decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            } catch (error) {
                // 토큰이 만료된 경우
                if (error.name === "TokenExpiredError") {
                    return res.status(401).json({ message: '토큰이 만료되었습니다' });
                } else {
                    throw new Error('유효하지 않은 토큰입니다');
                }
            }
    
            const userId = decodedToken.id;
            // 사용자 조회
            const user = await prisma.users.findUnique({
                where: { id: +userId }
            });
    
            if (!user) {
                throw new Error('토큰 사용자가 존재하지 않습니다');
            }
    
            // req 객체에 사용자 정보 할당
            req.user = user;
    
            next();
        } catch (error) {
            next(error);
        }
    }