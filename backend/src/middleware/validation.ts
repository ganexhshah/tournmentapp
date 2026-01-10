import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : undefined,
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  
  next();
};

// Auth validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters'),
  handleValidationErrors
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  handleValidationErrors
];

// User validation rules
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-letter country code'),
  body('timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone is invalid'),
  handleValidationErrors
];

// Tournament validation rules
export const createTournamentValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('game')
    .notEmpty()
    .isLength({ min: 1, max: 50 })
    .withMessage('Game is required and must be less than 50 characters'),
  body('format')
    .isIn(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS'])
    .withMessage('Invalid tournament format'),
  body('maxParticipants')
    .isInt({ min: 2, max: 1000 })
    .withMessage('Max participants must be between 2 and 1000'),
  body('entryFee')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Entry fee must be a positive number'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

// Team validation rules
export const createTeamValidation = [
  body('name')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Team name must be 3-50 characters and contain only letters, numbers, spaces, underscores, and hyphens'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('Max members must be between 2 and 20'),
  handleValidationErrors
];

// ID validation
export const idValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field is invalid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];