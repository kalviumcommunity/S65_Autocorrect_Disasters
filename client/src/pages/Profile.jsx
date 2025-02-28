import { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Camera, Pencil, Check, X } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You are not authenticated");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUser(response.data.data);
      setNewName(response.data.data.name);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNameEdit = () => {
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewName(user.name);
  };

  const saveNameChange = async () => {
    try {
      setIsEditing(false);
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUser(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update name");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    
    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append('avatar', imageFile);
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUser(response.data.data);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white">
          <svg className="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="p-4 rounded-md bg-zinc-900 border border-red-900/50 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-zinc-900 shadow-xl overflow-hidden"
      >
        <div className="relative">
          {/* Cover background */}
          <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-700"></div>
          
          {/* Avatar */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
            <div className="relative w-32 h-32 rounded-full border-4 border-zinc-900 overflow-hidden">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={user.avatar || "https://via.placeholder.com/128"} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Camera icon for upload */}
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={24} className="text-white" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </label>
            </div>
            
            {/* Upload button if image is selected */}
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={uploadImage}
                  disabled={isUploading}
                  className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-md flex items-center gap-1"
                >
                  {isUploading ? (
                    <>
                      <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* User info */}
        <div className="pt-20 pb-8 px-8 flex flex-col items-center">
          {/* Name */}
          <div className="mb-6 text-center">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 rounded-md border border-zinc-700 bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-600 text-center text-xl"
                />
                <button 
                  onClick={saveNameChange}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
                >
                  <Check size={16} className="text-green-500" />
                </button>
                <button 
                  onClick={cancelEdit}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl font-semibold">{user.name}</h1>
                <button 
                  onClick={handleNameEdit}
                  className="p-1 rounded-full hover:bg-zinc-800"
                >
                  <Pencil size={14} className="text-zinc-400" />
                </button>
              </div>
            )}
            {user.bio && <p className="text-sm text-zinc-400 mt-1">{user.bio}</p>}
          </div>
          
          {/* Stats */}
          <div className="w-full grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-xl font-bold">0</p>
              <p className="text-sm text-zinc-400">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">0</p>
              <p className="text-sm text-zinc-400">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">0</p>
              <p className="text-sm text-zinc-400">Members</p>
            </div>
          </div>
          
          {/* Contact info */}
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-zinc-800">
              <Mail size={18} className="text-zinc-400" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-zinc-800">
              <User size={18} className="text-zinc-400" />
              <span className="text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;