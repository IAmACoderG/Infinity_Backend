export class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something Is Wrong",//default parameter
        errors = [],
        stack = "",

    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.errors = errors;
        this.success = false;
        stack ? this.stack = stack : Error.captureStackTrace(this, this.constructor);
    }
}