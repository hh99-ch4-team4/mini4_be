const errorMessages = {


    
};
export default function errorHandlingMiddleware(err, req, res, next) {
    console.error(err);

    const status = err instanceof CustomError ? err.status : 500;
    const message = err.message || errorMessages[err.name] || '서버 내부에서 에러가 발생했습니다';

    res.status(status).json({ error: message });
}