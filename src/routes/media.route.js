import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import mediaUpload from "../middlewares/mediaUpload.js";
import { createMedia, getAllMediaForMemory, getMediaById, updateMediaCaption, deleteMedia } from "../controllers/media.controller.js";

const router = Router();

router.use(authMiddleware);

router.route("/memories/:memoryId/media").post(mediaUpload.array('media', 5), createMedia);
router.route("/memories/:memoryId/media").get(getAllMediaForMemory);
router.route("/media/:id").get(getMediaById);
router.route("/media/:id").patch(updateMediaCaption);
router.route("/media/:id").delete(deleteMedia);


export default router;