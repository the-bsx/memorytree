import { Router } from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = Router();

// applies auth to all below routes
router.use(authMiddleware);

router.route("/").post(upload.single("cover_image"), createEvent);
router.route("/").get(getAllEvents);
router.route("/:id").get(getEventById);
router.route("/:id").put(upload.single("cover_image"), updateEvent);
router.route("/:id").delete(deleteEvent);


export default router;
