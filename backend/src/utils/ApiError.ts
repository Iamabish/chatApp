interface IApiError {
    statusCode: number;
    message: string;
    errors?: Error[];
    stack?: string;
}

class ApiError extends Error implements IApiError {
    statusCode: number;
    errors?: Error[];
    data: null;
    success: boolean;

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: Error[] = [],
        stack?: string
    ) {

        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };