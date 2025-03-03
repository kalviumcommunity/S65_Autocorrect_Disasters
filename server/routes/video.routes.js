const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/auth")
const { uploadFile } = require("../middlewares/upload")

const {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  likeVideo,
  addComment,
  getUserVideos,
  fetchUserVideos,
} = require("../controllers/video.controller")

// Video routes
router.post("/upload", protect, uploadFile, uploadVideo)
router.get("/", getVideos)
router.get("/user/:userId", protect, getUserVideos)
router.get("/user", protect, fetchUserVideos)
router.get("/:id", getVideoById)
router.put("/:id", protect, updateVideo)
router.delete("/:id", protect, deleteVideo)
router.post("/:id/like", protect, likeVideo)
router.post("/:id/comment", protect, addComment)

module.exports = router