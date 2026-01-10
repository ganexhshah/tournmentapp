import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (
  error: ApiError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Unique constraint violation';
        details = {
          field: error.meta?.target,
          code: error.code
        };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        details = {
          code: error.code
        };
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint violation';
        details = {
          field: error.meta?.field_name,
          code: error.code
        };
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Invalid ID provided';
        details = {
          code: error.code
        };
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
        details = {
          code: error.code
        };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Send error response
  const response: any = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  if (details) {
    response.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};