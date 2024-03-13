import express from 'express';
import postsRouter from './routes/posts.router.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/', [postsRouter]);

app.use((req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // 모든 도메인 허용
    res.header('Access-Control-Allow-Origin', 'http://13.209.22.133'); // 특정 IPv4 퍼블릭 주소 허용
});

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});
