export class APIError extends Error {
    declare _statusCode: number
    constructor(message: string, statusCode: number) {
        super(message)
        this.name = 'APIError'
        this._statusCode = statusCode
    }
}