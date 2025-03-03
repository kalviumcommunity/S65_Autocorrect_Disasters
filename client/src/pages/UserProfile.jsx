"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { Edit, Grid, List, Loader, LogOut, Settings, Trash2, Video } from "lucide-react"
import UploadModal from "../components/Upload"

const UserProfile = () => {
  const { userId } = useParams()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profilePicture: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [activeTab, setActiveTab] = useState("videos")
  const [userVideos, setUserVideos] = useState([])
  const [viewMode, setViewMode] = useState("grid")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [profileUser, setProfileUser] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoadingProfile(true)
      try {
        // If userId is provided in URL, fetch that user's profile
        if (userId) {
          // Check if viewing own profile
          const isOwnProfile = user && userId === user._id
          setIsOwnProfile(isOwnProfile)

          if (isOwnProfile) {
            // If it's own profile, use user data from context
            setProfileUser(user)
            setFormData({
              username: user.username || "",
              bio: user.bio || "",
              profilePicture: null,
            })
            setImagePreview(user.profilePicture || "/default-avatar.png")
          } else {
            // If it's another user's profile, fetch their data
            await fetchUserProfile(userId)
          }
          // Fetch videos for the profile being viewed
          await fetchUserVideos(userId)
        } else {
          // If no userId in URL, show logged-in user's profile
          if (!isAuthenticated) {
            navigate("/login")
            return
          }
          setIsOwnProfile(true)
          setProfileUser(user)
          setFormData({
            username: user.username || "",
            bio: user.bio || "",
            profilePicture: null,
          })
          setImagePreview(user.profilePicture || "/default-avatar.png")
          await fetchUserVideos(user._id)
        }
      } catch (error) {
        console.error("Error initializing profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setIsLoadingProfile(false)
      }
    }

    initializeProfile()
  }, [userId, user, isAuthenticated, navigate])

  const fetchUserProfile = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      if (!data.user) {
        throw new Error("User not found")
      }

      setProfileUser(data.user)
      setImagePreview(data.user.profilePicture || "/default-avatar.png")
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast.error("Failed to load user profile")
      navigate("/")
    }
  }

  const fetchUserVideos = async (id) => {
    try {
      const endpoint = `http://localhost:3000/api/videos/user/${id}`
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user videos")
      }

      const data = await response.json()
      setUserVideos(data.videos || [])
    } catch (error) {
      console.error("Error fetching user videos:", error)
      toast.error("Failed to load videos")
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const formDataToSend = new FormData()
      if (formData.username) formDataToSend.append("username", formData.username)
      if (formData.bio !== undefined) formDataToSend.append("bio", formData.bio)
      if (formData.profilePicture) formDataToSend.append("profilePicture", formData.profilePicture)

      const response = await fetch("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      setUser(data.user)
      setProfileUser(data.user)
      setEditMode(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete video")
      }

      setUserVideos((prev) => prev.filter((video) => video._id !== videoId))
      toast.success("Video deleted successfully")
    } catch (error) {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4"
    >
      {profileUser ? (
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={imagePreview || "/default-avatar.png"}
                  alt={profileUser.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isOwnProfile && editMode && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-md">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Edit className="w-4 h-4" />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, username: e.target.value }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Username"
                    />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Bio"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        {updating ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-between mb-4">
                      <h1 className="text-2xl font-bold">{profileUser.username}</h1>
                      {isOwnProfile && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditMode(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          <button
                            onClick={logout}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <LogOut className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{profileUser.bio || "No bio yet"}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("videos")}
                  className={`px-4 py-2 rounded-full ${
                    activeTab === "videos"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <Video className="w-5 h-5 inline-block mr-2" />
                  Videos
                </motion.button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid" ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list" ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Videos Grid/List */}
            {activeTab === "videos" && (
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }`}
              >
                {userVideos.length > 0 ? (
                  userVideos.map((video) => (
                    <div
                      key={video._id}
                      className={`bg-gray-50 rounded-lg overflow-hidden ${
                        viewMode === "list" ? "flex gap-4" : ""
                      }`}
                    >
                      <Link
                        to={`/video/${video._id}`}
                        className={viewMode === "list" ? "w-48" : ""}
                      >
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className={`w-full aspect-video object-cover ${
                            viewMode === "list" ? "h-full" : ""
                          }`}
                        />
                      </Link>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                        {isOwnProfile && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingVideo(video)
                                setIsEditModalOpen(true)
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 col-span-full">
                    <p className="text-gray-500">No videos yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">User not found</p>
        </div>
      )}

      {/* Edit Video Modal */}
      <UploadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingVideo(null)
        }}
        videoToEdit={editingVideo}
      />
    </motion.div>
  )
}

export default UserProfile