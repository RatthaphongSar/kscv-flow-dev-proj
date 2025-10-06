import { Router } from "express";
import * as ctrl from "../controllers/chat.js";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

// Create group room (manual)
router.post(
  "/rooms",
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

// List rooms for user
router.get(
  "/rooms",
  [query("userId").isString().withMessage("userId is required")],
  validate,
  ctrl.listRooms
);

// Send message
router.post(
  "/rooms/:roomId/messages",
  [
    param("roomId").isString().withMessage("roomId is required"),
    body("userId").isString().withMessage("userId is required"),
    body("content").isString().withMessage("content is required"),
  ],
  validate,
  ctrl.sendMessage
);

router.get('/rooms/:roomId/messages', [
  param('roomId').isString(),
  query('limit').optional().isInt({min:1,max:200})
], validate, ctrl.listMessages)

router.get(
  '/rooms/:roomId/messages',
  [param('roomId').isString(), query('limit').optional().isInt({ min: 1, max: 200 })],
  validate,
  ctrl.listMessages        // ✅ ตอนนี้จะไม่ undefined แล้ว
)

export default router