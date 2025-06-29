import { Request, Response, NextFunction } from 'express'
import { APIError } from '../utils'

export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔥 Error:', err)

  const isApiError = err instanceof APIError
  const statusCode = isApiError ? err._statusCode : 500

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error'
  })
}