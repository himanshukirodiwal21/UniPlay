// src/routes/autoPlay.routes.js
import { Router } from "express";
import {
  uploadAutoPlayJSON,
  startAutoPlay,
  pauseAutoPlay,
  changeSpeed,
  stopAutoPlay,
  getAutoPlayStatus,
} from "../controllers/autoPlay.controller.js";

const router = Router();

// 📤 Upload Cricsheet JSON
router.post("/:matchId/upload", uploadAutoPlayJSON);

// ▶️ Start auto-play
router.post("/:matchId/start", startAutoPlay);

// ⏸️ Pause auto-play
router.post("/:matchId/pause", pauseAutoPlay);

// ⏩ Change playback speed
router.patch("/:matchId/speed", changeSpeed);

// ⏹️ Stop auto-play (reset to beginning)
router.post("/:matchId/stop", stopAutoPlay);

// 📊 Get current status
router.get("/:matchId/status", getAutoPlayStatus);

export default router;