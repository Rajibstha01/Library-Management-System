//for all error in middle ware.


class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "internal server error";
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000) {
        const message = `Duplicate Field Value Entered`;
        const statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid. Try Again`;
        const statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired`;
        const statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        const statusCode = 400;
        err = new ErrorHandler(message, statusCode);
    }

    const errMessage = err.errors ? Object.values(err.errors).map(e => e.message).join(" ") : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errMessage,
    });
};

export default ErrorHandler;