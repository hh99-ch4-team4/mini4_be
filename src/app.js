import express from 'express';
import postsRouter from './routes/posts.router.js';
import usersRouter from './routes/users.router.js'
import cookieParser from "cookie-parser";


const app = express();
const PORT = 3000;
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // "*"는 모든 도메인에서의 요청을 허용함을 의미합니다. 보안상의 이유로, 실제 배포 환경에서는 특정 도메인을 지정하는 것이 좋습니다.
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //next();
  });



app.use(express.json());
app.use(cookieParser());

app.use('/', [postsRouter, usersRouter]);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});
