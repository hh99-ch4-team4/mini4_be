import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { likeController } from '../Controller/likeController.js';

const router = express.Router();

// 좋아요 API
router.post('/posts/:postId/likes', authMiddleware, likeController);

export default router;

// import express from 'express';
// import { prisma } from '../utils/prisma/index.js';
// import authMiddleware from '../middlewares/auth.middleware.js';

// const router = express.Router();
// // 좋아요 API
// router.post('/posts/:postId/likes', authMiddleware, async (req, res, next) => {
//     try {
//         const { postId } = req.params;
//         const userId = res.locals.user.id;

//         if (!postId || !userId) return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

//         const post = await prisma.posts.findFirst({ where: { id: +postId } });
//         if (!post) return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });

//         // 좋아요를 처음 누르는건지 아닌지에 따른 좋아요의 상태 찾기
//         // : 좋아요를 한 번도 누르지 않았다면 like는 없을 것이고, 누른적이 있다면 like가 있을 것이다.
//         const like = await prisma.likes.findFirst({
//             where: { postId: +postId, userId: +userId },
//         });

//         let responseMessage = '';
//         if (like) {
//             // 좋아요를 처음 누른게 아닌데 또 좋아요를 누르는 상황이라면, 좋아요 값을 전환하여 반환
//             const updatedLike = await prisma.likes.update({
//                 where: { id: like.id },
//                 data: { likeCheck: !like.likeCheck },
//             });
//             responseMessage = updatedLike.likeCheck ? '좋아요를 등록했습니다' : '좋아요를 취소했습니다.';
//         } else {
//             // 좋아요를 처음 누른다면, 좋아요 등록.
//             await prisma.likes.create({
//                 data: { postId: +postId, userId: +userId, likeCheck: true },
//             });
//             responseMessage = '좋아요를 등록했습니다.';
//         }

//         // 좋아요 개수 count
//         const likeCount = await prisma.likes.count({
//             where: { postId: +postId, likeCheck: true },
//         });

//         return res.status(201).json({ message: responseMessage, likeCount });
//     } catch (error) {
//         console.error(error);
//         // next(error);
//     }
// });
// export default router;
