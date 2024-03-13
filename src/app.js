import express from 'express';
import postsRouter from './routes/posts.router.js';
import usersRouter from './routes/users.router.js'
import cookieParser from "cookie-parser";


const app = express();
const PORT = 3000;


app.use(express.json());
app.use(cookieParser());

app.use('/', [postsRouter, usersRouter]);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});
