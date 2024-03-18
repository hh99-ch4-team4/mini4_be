import * as PostService from '../Services/postsService.js'
import schemas from '../utils/schemas/postSchema.js'

const [postSchema, postDetailSchema, voteSchema] = schemas;

// 1. 게시물 생성 
export const createPostController = async(req, res, next) =>{
    try {
        const userId = res.locals.user.id;

     // 스키마를 사용하여 요청 본문 검증
    const { error, value } = postSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
    const { title, content, startDate, endDate, options } = value;

    const post = await PostService.createPost({userId, title, content, startDate, endDate, options})
    res.status(201).json(post)
}catch (error) {
        console.error(error);
        // next(error);
    }
};

//2. 모든 게시물 조회 
export const getAllPostsController = async(req, res, next) =>{
    try{
    const allPosts = await PostService.getAllPosts();
    res.status(200).json(allPosts);
}catch (error) {
    console.error(error);
}};

//