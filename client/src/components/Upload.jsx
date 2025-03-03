"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, UploadIcon, Camera } from "lucide-react"
import { toast } from "react-hot-toast"

const Upload = ({ isOpen, onClose, editMode = false, photoToEdit = null }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (editMode && photoToEdit) {
      setTitle(photoToEdit.title || "")
      setDescription(photoToEdit.description || "")
      setHashtags(photoToEdit.hashtags?.join(" ") || "")
      setPreview(photoToEdit.thumbnailUrl || photoToEdit.videoUrl)
    }
  }, [editMode, photoToEdit])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, JPG, PNG, GIF)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setImageFile(file)
    const imageUrl = URL.createObjectURL(file)
    setPreview(imageUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editMode && photoToEdit) {
      try {
        setUploading(true)
        toast.loading("Updating photo...")

        const updateData = {
          title,
          description,
          hashtags: hashtags.split(" ").filter((tag) => tag.startsWith("#")),
        }

        const response = await fetch(`http://localhost:3000/api/videos/${photoToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to update photo")
        }

        toast.dismiss()
        toast.success("Photo updated successfully!")
        onClose()
      } catch (error) {
        console.error("Update error:", error)
        toast.dismiss()
        toast.error(error.message || "Failed to update photo")
      } finally {
        setUploading(false)
      }
    } else {
      if (!imageFile) {
        toast.error("Please select an image to upload")
        return
      }

      if (!title.trim()) {
        toast.error("Please add a title")
        return
      }

      try {
        setUploading(true)
        toast.loading("Uploading photo...")

        const formData = new FormData()
        formData.append("video", imageFile) // Keep field name as 'video' for API compatibility
        formData.append("title", title)
        formData.append("description", description)

        if (hashtags.trim()) {
          formData.append("hashtags", hashtags)
        }

        const response = await fetch("http://localhost:3000/api/videos/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to upload photo")
        }

        toast.dismiss()
        toast.success("Photo uploaded successfully!")

        setTitle("")
        setDescription("")
        setHashtags("")
        setImageFile(null)
        setPreview(null)

        onClose()
      } catch (error) {
        console.error("Upload error:", error)
        toast.dismiss()
        toast.error(error.message || "Failed to upload photo")
      } finally {
        setUploading(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{editMode ? "Edit Photo" : "Upload Photo"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {editMode ? (
            <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden">
              <img
                src={preview || "/placeholder-image.jpg"}
                alt="Photo thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          ) : !preview ? (
            <div
              onClick={() => document.getElementById("image-upload").click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Camera className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center mb-2">Click to upload a photo</p>
              <p className="text-xs text-gray-400 text-center">JPEG, JPG, PNG, or GIF (max. 5MB)</p>
              <input type="file" id="image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden">
              <img src={preview || "/placeholder.svg"} className="w-full h-full object-contain" alt="Uploaded Photo" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setPreview(null)
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title to your photo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your photo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              />
            </div>

            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-1">
                Hashtags
              </label>
              <input
                type="text"
                id="hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#puppies #cute #playtime"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg mr-2 hover:bg-gray-200"
                disabled={uploading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{editMode ? "Updating..." : "Uploading..."}</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-5 h-5" />
                    <span>{editMode ? "Update Photo" : "Upload Photo"}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default Upload

