import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();
//
// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    const { userName, nickname, password } = req.body;
    if (!userName || !nickname || !password) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
    }
    const ExistingUser = await prisma.users.findFirst({
        where : {userName}
    });
    if(ExistingUser){
        return res.status(409).json({message : '이미 사용중인 유저네임 입니다'})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
        data: {
            userName,
            nickname,
            password : hashedPassword,
        },
    });
    return res.status(201).json({ user });
});


const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
// 로그인 API

router.post('/log-in', async (req, res, next) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
    }
    const user = await prisma.users.findFirst({
        where: { userName },
    });
    if (!user) {
        return res.status(400).json({ message: '존재하지 않는 닉네임입니다' });
    }
    if (!(await bcrypt.compare(password, user.password))){
        return res.status(401).json({message : '비밀번호가 올바르지 않습니다'})
    }
    const accessToken = jwt.sign({id : user.id}, accessTokenSecret, { expiresIn: '38m' });

    res.cookie('authorization', `Bearer ${accessToken}`)
    
    return res.status(200).json({message: '로그인에 성공하였습니다'})
});

export default router;
