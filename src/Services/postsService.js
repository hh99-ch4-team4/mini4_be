import * as PostRepository from '../Repository/postsRepository.js';

// 게시글 생성
export const createPost = async({userId, title, content, startDate, endDate, options}) => {
    return await PostRepository.createPost({userId, title, content, startDate, endDate, options})
};

// 모든 게시글 조회 
export const getAllPosts = async() => {
    const allPosts = await PostRepository.readAllPosts();

    return allPosts.map((post) => ({
        id: post.id,
        title: post.title,
        startDate: post.startDate,
        endDate: post.endDate,
    }));
}
//