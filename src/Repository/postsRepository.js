import { prisma } from '../utils/prisma/index.js'; 

// 게시글 등록 
export const createPost = async({userId,  title, content, startDate, endDate, options})=>{
    return await prisma.posts.create({
                    data: {
                        title,
                        content,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        userId,
                        options: {
                            create: options.map((option) => ({
                                content: option.content,
                            })),
                        },
                    },
                    include: { options: true }, // 생성된 옵션 정보도 함께 반환
                });
        
}

//게시글 전체 조회
export const readAllPosts = async() => {
    return await prisma.posts.findMany({
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
} 

//