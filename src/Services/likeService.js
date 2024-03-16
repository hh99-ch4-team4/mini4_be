// import * as LikeRepository from '../Repository/likeRepository.js';
// import { prisma } from '../utils/prisma/index.js'; // prisma 인스턴스 임포트가 필요합니다.

// export const like = async ({ postId, userId }) => {
//     const post = await LikeRepository.checkPostExists(postId);
//     if (!post) {
//         return res.status(404).json({ message: '존재하지 않는 게시글입니다.' });
//     }

//     // 좋아요를 처음 누르는건지 아닌지에 따른 좋아요의 상태 찾기
//     // : 좋아요를 한 번도 누르지 않았다면 like는 없을 것이고, 누른적이 있다면 like가 있을 것이다.
//     const like = await prisma.likes.findLike({ postId, userId });
//     // console.log('🩷🩷🩷 likeId' + like.id);

//     let responseMessage = '';
//     if (like) {
//         await LikeRepository.toggleLike(like.id, !like.likeCheck);
//         // console.log('🩷🩷🩷 likeId' + like.id);
//         responseMessage = !like.likeCheck ? '좋아요를 등록했습니다' : '좋아요를 취소했습니다.';
//     } else {
//         await LikeRepository.createLike(postId, userId);
//         responseMessage = '좋아요를 등록했습니다.';
//     }

//     const likeCount = await LikeRepository.countLikes(postId);

//     return { message: responseMessage, likeCount };
// };
