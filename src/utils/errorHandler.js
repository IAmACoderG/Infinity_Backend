export class ApiError extends Error {
    constructor(
        statusCode,
        massage = "Something Is Wrong",//default parameter
        errors = [],
        stack = "",

    ) {
        super(massage);
        this.statusCode = statusCode;
        this.data = null;
        this.message = massage;
        this.errors = errors;
        this.success = false;
        stack ? this.stack = stack : Error.captureStackTrace(this, this.constructor);
    }
}