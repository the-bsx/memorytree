import { Router } from "express";
import { createMemory, getAllMemoriesForEvent, getMemoryById, updateMemory, deleteMemory } from "../controllers/memory.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();

router.use(authMiddleware);
router.route("/events/:eventId/memories").post(createMemory);
router.route("/events/:eventId/memories").get(getAllMemoriesForEvent);
router.route("/memories/:id").get(getMemoryById);
router.route("/memories/:id").put(updateMemory);
router.route("/memories/:id").delete(deleteMemory);
export default router;
