import { Router } from "express";
import {
  getSettings,
  updateSettings,
  uploadBusinessLogo
} from "../controllers/settingsController.js";
import { uploadLogo } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(getSettings));
router.put("/", asyncHandler(updateSettings));
router.post("/logo", uploadLogo.single("logo"), asyncHandler(uploadBusinessLogo));
export default router;
