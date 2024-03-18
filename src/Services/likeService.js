import * as LikeRepository from '../Repository/likeRepository.js';

export const like = async ({ postId, userId }) => {
    const post = await LikeRepository.checkPostExists({ id: +postId });
    if (!post) {
        throw new Error('존재하지 않는 게시글입니다.');
    }

    // 좋아요를 처음 누르는건지 아닌지에 따른 좋아요의 상태 찾기
    // : 좋아요를 한 번도 누르지 않았다면 like는 없을 것이고, 누른적이 있다면 like가 있을 것이다.
    const like = await LikeRepository.findLike(postId, userId);

    let responseMessage = '';
    if (like) {
        // 좋아요를 처음 누른게 아닌데 또 좋아요를 누르는 상황이라면, 좋아요 값을 전환하여 반환
        await LikeRepository.toggleLike(like.id, !like.likeCheck);
        responseMessage = !like.likeCheck ? '좋아요를 등록했습니다' : '좋아요를 취소했습니다.';
    } else {
        // 좋아요를 처음 누른다면, 좋아요 등록.
        await LikeRepository.createLike({ postId, userId });
        responseMessage = '좋아요를 등록했습니다.';
    }

    // 좋아요 개수 세기
    const likeCount = await LikeRepository.countLikes(postId);

    return { message: responseMessage, likeCount };
};
