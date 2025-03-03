"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, Menu, Upload, Home, Compass, User, TrendingUp } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-hot-toast"
import UploadModal from "../components/Upload"
import PhotoCard from "../components/VideoCard"

const PhotoFeed = () => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const navigate = useNavigate()
  const { isAuthenticated, refreshToken } = useAuth()

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true)
      try {
        // Check token validity first
        if (isAuthenticated) {
          const tokenValid = await validateToken()
          if (!tokenValid) {
            // If token is invalid, attempt to refresh it
            await refreshToken()
          }
        }

        // Then fetch photos - even if not authenticated, we can still show public photos
        await fetchPhotos()

        // Only fetch user if authenticated
        if (isAuthenticated) {
          await fetchCurrentUser()
        }
      } catch (error) {
        console.error("Error initializing page:", error)
        // Clear local storage if token is invalid
        if (error.message === "JWT malformed" || error.message === "invalid token") {
          localStorage.removeItem("token")
          toast.error("Session expired. Please log in again.")
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [isAuthenticated, navigate, refreshToken])

  const validateToken = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false

      const response = await fetch("http://localhost:3000/api/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Token validation error:", error)
      return false
    }
  }

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const headers = {
        "Content-Type": "application/json",
      }

      if (isAuthenticated) {
        const token = localStorage.getItem("token")
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }
      }

      const response = await fetch("http://localhost:3000/api/videos", { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      // Sort photos by createdAt date in descending order (newest first)
      const sortedPhotos = (data.videos || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setPhotos(sortedPhotos)
      // After setting photos, update suggested users
      updateSuggestedUsers(sortedPhotos)
    } catch (error) {
      console.error("Error fetching photos:", error)
      toast.error("Failed to load photos")
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    if (!isAuthenticated) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      const response = await fetch("http://localhost:3000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed")
        }
        throw new Error("Failed to fetch user profile")
      }

      const data = await response.json()
      if (data.user) {
        setCurrentUser(data.user)
      } else {
        console.error("No user data in response")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      if (error.message === "Authentication failed") {
        localStorage.removeItem("token")
        toast.error("Session expired. Please log in again.")
        navigate("/login")
      } else {
        toast.error("Failed to load user profile")
      }
    }
  }

  const updateSuggestedUsers = (photosList) => {
    try {
      const userMap = new Map()

      photosList.forEach((photo) => {
        if (photo.user && photo.user._id) {
          if (!userMap.has(photo.user._id)) {
            userMap.set(photo.user._id, {
              ...photo.user,
              photoCount: 1,
            })
          } else {
            const userData = userMap.get(photo.user._id)
            userMap.set(photo.user._id, {
              ...userData,
              photoCount: userData.photoCount + 1,
            })
          }
        }
      })

      const sortedUsers = Array.from(userMap.values())
        .sort((a, b) => b.photoCount - a.photoCount)
        .filter((user) => user._id !== currentUser?._id) // Exclude current user
        .slice(0, 5) // Take top 5 users

      setSuggestedUsers(sortedUsers)
    } catch (error) {
      console.error("Error updating suggested users:", error)
    }
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to upload photos")
      navigate("/login")
      return
    }
    setShowUploadModal(true)
  }

  const handleModalClose = () => {
    setShowUploadModal(false)
    // Refresh photos after upload
    fetchPhotos()
  }

  const handleFollow = async (userId) => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users")
      navigate("/login")
      return
    }

    // Implement follow functionality
    toast.success("Follow feature coming soon!")
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`
    } else {
      const diffYears = Math.floor(diffDays / 365)
      return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`
    }
  }

  const handleLike = async (photoId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/videos/${photoId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to like photo")
      }

      const data = await response.json()

      // Update photos state with the new likes array
      setPhotos((prevPhotos) => prevPhotos.map((p) => (p._id === photoId ? { ...p, likes: data.likes } : p)))
    } catch (error) {
      console.error("Error liking photo:", error)
      toast.error("Failed to like photo")
    }
  }

  const handleComment = async (photoId, commentText, setComment) => {
    try {
      const response = await fetch(`http://localhost:3000/api/videos/${photoId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: commentText }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const data = await response.json()

      // Update the photos state with the new comment, including the current user info
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) =>
          p._id === photoId
            ? {
                ...p,
                comments: [
                  {
                    ...data.comments[0],
                    user: currentUser, // Add current user info to the new comment
                  },
                  ...p.comments,
                ],
              }
            : p,
        ),
      )

      setComment("")
    } catch (error) {
      console.error("Error commenting:", error)
      toast.error("Failed to add comment")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Upload Modal */}
      <UploadModal isOpen={showUploadModal} onClose={handleModalClose} />

      {/* Fixed Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 bg-white border-b z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                <Menu className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                className="hidden md:block"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" />
              </motion.button>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
              >
                PawPlay
              </motion.span>
            </div>

            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden text-gray-600"
              >
                <Search className="w-6 h-6" />
              </motion.button>

              {isAuthenticated ? (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUploadClick}
                    className="hidden md:flex px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full items-center space-x-2 shadow-md"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUploadClick}
                    className="md:hidden text-gray-600"
                  >
                    <Upload className="w-6 h-6" />
                  </motion.button>

                  <motion.button type="button" whileHover={{ scale: 1.05 }} className="relative">
                    <Bell className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      3
                    </span>
                  </motion.button>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link to="/profile">
                      <img
                        src={currentUser?.profilePicture || "/default-avatar.png"}
                        alt={currentUser?.username || "Profile"}
                        className="w-8 h-8 rounded-full cursor-pointer border border-gray-200 object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "/default-avatar.png"
                        }}
                      />
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-md"
                >
                  Login
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-16 left-0 bottom-0 w-64 bg-white z-40 border-r shadow-lg md:hidden"
          >
            <div className="p-4">
              <nav className="space-y-2">
                <Link to="/">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-blue-500 bg-blue-50 rounded-lg"
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </motion.div>
                </Link>
                <Link to="/explore">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Compass className="w-5 h-5" />
                    <span>Explore</span>
                  </motion.div>
                </Link>
                <Link to="/trending">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Trending</span>
                  </motion.div>
                </Link>
                <Link to="/profile">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </motion.div>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {/* Left Sidebar - Desktop */}
            <div className="w-64 fixed left-0 top-16 h-screen border-r p-4 bg-white hidden md:block">
              <nav className="space-y-2">
                <Link to="/">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-blue-500 bg-blue-50 rounded-lg"
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </motion.div>
                </Link>
                <Link to="/explore">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Compass className="w-5 h-5" />
                    <span>Explore</span>
                  </motion.div>
                </Link>
                <Link to="/trending">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Trending</span>
                  </motion.div>
                </Link>
                <Link to="/profile">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </motion.div>
                </Link>
              </nav>
            </div>

            {/* Main Feed */}
            <div className="md:ml-5 flex-1 flex justify-center">
              <div className="max-w-2xl w-full">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
                    />
                  </div>
                ) : photos.length > 0 ? (
                  photos.map((photo) => (
                    <PhotoCard
                      key={photo._id}
                      photo={photo}
                      currentUser={currentUser}
                      isAuthenticated={isAuthenticated}
                      formatTimeAgo={formatTimeAgo}
                      onLike={handleLike}
                      onComment={handleComment}
                      setVideos={setPhotos}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-xl text-gray-600 mb-4">No photos available</p>
                    {isAuthenticated && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUploadClick}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center space-x-2 shadow-md"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload Your First Photo</span>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Desktop */}
            <div className="w-80 fixed right-0 top-16 h-screen border-l p-4 bg-white hidden lg:block overflow-y-auto">
              <h3 className="font-semibold mb-4">Suggested Accounts</h3>
              <div className="space-y-2">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <motion.div key={user._id} whileHover={{ x: 5 }} className="flex items-center justify-between py-2">
                      <Link to={`/profile/${user._id}`} className="flex items-center space-x-3 flex-1">
                        <img
                          src={user.profilePicture || "/default-avatar.png"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/default-avatar.png"
                          }}
                        />
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-gray-500">
                            {user.photoCount} {user.photoCount === 1 ? "photo" : "photos"}
                          </p>
                        </div>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm font-medium text-blue-500"
                        onClick={() => handleFollow(user._id)}
                      >
                        Follow
                      </motion.button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No suggested accounts yet</div>
                )}
              </div>

              <h3 className="font-semibold mt-8 mb-4">Trending Pet Tags</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "#FunnyPets",
                  "#CutePuppies",
                  "#SillyCats",
                  "#PetFails",
                  "#AnimalAntics",
                  "#PawfectMoments",
                  "#PetBlooper",
                  "#DogsBeingDerps",
                  "#CatsChasingThings",
                  "#PuppyZoomies",
                  "#WhiskersWednesday",
                  "#FluffyFriends",
                ].map((tag) => (
                  <motion.div
                    key={tag}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#EEF2FF", // Light indigo background on hover
                      color: "#4F46E5", // Indigo text on hover
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200 font-medium transition-colors duration-200"
                  >
                    {tag}
                  </motion.div>
                ))}
              </div>

              <h3 className="font-semibold mt-8 mb-4">Popular Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Funny Dogs", icon: "🐕" },
                  { name: "Silly Cats", icon: "🐱" },
                  { name: "Pet Fails", icon: "😅" },
                  { name: "Cute Moments", icon: "🥰" },
                  { name: "Animal Friends", icon: "🤝" },
                  { name: "Pet Tricks", icon: "🎯" },
                ].map((category) => (
                  <motion.div
                    key={category.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoFeed

