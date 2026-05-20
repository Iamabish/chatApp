interface IApiResponse {
    success : boolean,
    statusCode : number,
    data? : unknown,
    message? : string
}


class ApiResponse implements IApiResponse {
    success: boolean;
    statusCode: number; 
    data?: unknown;
    message?: string;


    constructor(statusCode : number, message? : string,data?: unknown) {


        this.success = statusCode < 400,
        this.statusCode = statusCode,
        this.data = data,
        this.message = message
    }
}


export { ApiResponse  }