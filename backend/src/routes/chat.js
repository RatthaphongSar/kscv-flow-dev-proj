import { Router } from "express";
import * as ctrl from "../controllers/chat.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Create group room (manual)
router.post(
  "/rooms",
  authRequired,
  [
    body("name").isString().withMessage("Room name is required"),
    body("memberIds")
      .optional()
      .isArray()
      .withMessage("memberIds must be an array"),
  ],
  validate,
  ctrl.createRoom
);

// Auto-generate rooms by year & major (communities)
router.get("/rooms/auto", ctrl.autoRooms);

// List rooms
router.get(
  "/rooms",
  [query("search").optional().isString()],
  validate,
  ctrl.getRooms
);

// Send message
router.post(
  "/rooms/:roomId/messages",
  [
    param("roomId").isString().withMessage("roomId is required"),
    body("content").isString().withMessage("content is required"),
    body("type").optional().isString().isIn(['text', 'image', 'file']).withMessage("type must be 'text', 'image' or 'file'"),
    body("fileUrl").optional().isString().withMessage("fileUrl must be a string"),
  ],
  validate,
  ctrl.sendMessage
);

// router.get(
//   '/rooms/:roomId/messages',
//   [
//     param('roomId').isString(), 
//     query('limit').optional().isInt({ min: 1, max: 200 })
//   ],
//   validate,
//   ctrl.listMessages
// );

// Mark message as read
router.post('/rooms/:roomId/messages/:messageId/read',
  [
    param('roomId').isString().withMessage('roomId is required'),
    param('messageId').isString().withMessage('messageId is required')
  ],
  validate,
  ctrl.markMessageAsRead
);

// Reply to message
router.post('/rooms/:roomId/messages/:messageId/reply',
  [
    param('roomId').isString().withMessage('roomId is required'),
    param('messageId').isString().withMessage('messageId is required'),
    body('content').isString().withMessage('content is required'),
    body('type').optional().isString().isIn(['text', 'image', 'file']).withMessage("type must be 'text', 'image' or 'file'")
  ],
  validate,
  ctrl.replyToMessage
)

// Route has been merged with the one above

export default router