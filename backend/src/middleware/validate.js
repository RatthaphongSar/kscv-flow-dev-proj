// backend/src/middleware/validate.js
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  console.log('[DEBUG] Request body:', req.body);
  console.log('[DEBUG] Content-Type:', req.headers['content-type']);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[DEBUG] Validation errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};
