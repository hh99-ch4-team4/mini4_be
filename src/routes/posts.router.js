import express from "express";
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 게시글 등록 API
router.post('/posts', async (req, res, next) => {
    const {title,content,startDate,endDate,multiVote,userId} = req.body;

    const newPost = await prisma.posts.create({
        data: {
            title,
            content,
            startDate: new Date(startDate),
            endDate: new Date(endDate), 
            multiVote,
            userId,
            },
        })
        return res.status(201).json({newPost, message: "카테고리를 등록하였습니다." });
});
    
// 게시글 전체 조회 API
router.get('/posts', async (req, res,next) => {
    const postList = await prisma.posts.findMany({
        select: {
            id : true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            startDate: true,
            endDate: true,
            multiVote: true,
            likeCount: true,
            commentsCount: true
        }
    });

    return res.status(200).json({data: postList});
    

});

// 게시글 상세 조회 API
router.get('/posts/:postId', async(req, res, next) =>{

        const{postId} =req.params;

        const post = await  prisma.posts.findFirst({
            where: { id: parseInt(postId) },
            select: {
                id: true,
                title: true,
                content: true,
                startDate: true,
                endDate: true,
                multiVote: true,
                // user: {
                //     select: {
                //         userName: true,
                //         nickname: true
                //     }
                // }
            }
        });
        return res.status(200).json({post})});
// 게시글 수정 API

// 게시글 삭제 API

export default router;
