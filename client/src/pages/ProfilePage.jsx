"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Camera, Loader, LogOut, Edit, Trash2, Video, Grid, List, Home, Compass, TrendingUp, User, Bell, Search } from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import Upload from "../components/Upload"

const ProfilePage = () => {
  const { isAuthenticated, user, logout, verifyAuth, setUser, isLoading } = useAuth()
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

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate, isLoading])

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        bio: user.bio || "",
        profilePicture: null,
      })
      setImagePreview(user.profilePicture || "/default-avatar.png")
      fetchUserVideos()
    }
  }, [user])

  const fetchUserVideos = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/videos/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch user videos")
      const data = await response.json()
      setUserVideos(data.videos)
    } catch (error) {
      console.error("Error fetching user videos:", error)
      toast.error("Failed to load your videos")
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      setFormData((prev) => ({ ...prev, profilePicture: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("username", formData.username)
      if (formData.bio !== null && formData.bio !== undefined) {
        formDataToSend.append("bio", formData.bio)
      }
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture)
      }

      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication required")

      const response = await fetch("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Update failed")

      setUser({ ...user, ...data.user })
      setEditMode(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(error.message || "Failed to update profile")
      if (error.message?.includes("unauthorized") || error.message?.includes("token")) {
        verifyAuth()
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/videos/${videoId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!response.ok) throw new Error("Failed to delete video")
        setUserVideos(userVideos.filter((video) => video._id !== videoId))
        toast.success("Video deleted successfully")
      } catch (error) {
        console.error("Error deleting video:", error)
        toast.error("Failed to delete video")
      }
    }
  }

  const VideoCard = ({ video }) => (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnailUrl || "/placeholder-video.jpg"}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-black rounded-full p-2"
            onClick={() => navigate(`/video/${video._id}`)}
          >
            <Video className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{video.title}</h3>
        <p className="text-sm text-gray-600 mb-2 truncate">{video.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{video.views} views</span>
          <div className="space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                setEditingVideo(video)
                setIsEditModalOpen(true)
              }}
            >
              <Edit className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteVideo(video._id)}
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const FloatingNavbar = () => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-white/90 backdrop-blur-lg px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
        <nav className="flex items-center space-x-8">
          <Link to="/feed">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center group"
            >
              <Home className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">Home</span>
            </motion.div>
          </Link>
          <Link to="/explore">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center group"
            >
              <Compass className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">Explore</span>
            </motion.div>
          </Link>
          <Link to="/trending">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center group"
            >
              <TrendingUp className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">Trending</span>
            </motion.div>
          </Link>
          <Link to="/profile">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center group"
            >
              <User className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-blue-500">Profile</span>
            </motion.div>
          </Link>
        </nav>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated && !isLoading) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-6 pb-24 px-4"
    >
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
            >
              PawPlay
            </motion.span>
            
            <div className="flex-1 maxw-xl mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <motion.div
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative group">
                <img
                  src={imagePreview || "/default-avatar.png"}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  alt="Profile"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <Camera className="w-5 h-5 text-gray-700" />
                  </label>
                )}
              </div>
            </motion.div>

            {!editMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </motion.button>
            )}
          </div>

          <div className="px-6 pt-20 pb-6">
            <AnimatePresence mode="wait">
              {editMode ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleProfileUpdate}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2 text-xl font-semibold bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Username"
                    required
                  />

                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Tell your story..."
                  />

                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updating}
                      className="bg-blue-500 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                    >
                      {updating && <Loader className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          username: user?.username || "",
                          bio: user?.bio || "",
                          profilePicture: null,
                        })
                        setImagePreview(user?.profilePicture || "/default-avatar.png")
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="profile-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                  <p className="mt-4 text-gray-600 text-lg leading-relaxed">{user?.bio || "No bio yet ✏️"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("videos")}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    activeTab === "videos"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Video className="w-5 h-5 inline-block mr-2" />
                  Your Videos
                </motion.button>
              </div>
              
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-md"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-md"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "videos" ? (
                  <div
                    className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                  >
                    {userVideos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                ) : (
                  <div></div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <FloatingNavbar />
      
      <Upload 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingVideo(null)
          fetchUserVideos()
        }}
        editMode={true}
        videoToEdit={editingVideo}
      />
    </motion.div>
  )
}

export default ProfilePage