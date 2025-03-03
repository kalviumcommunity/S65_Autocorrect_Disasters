import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, BookMarked, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PhotoCard = ({ photo, currentUser, isAuthenticated, formatTimeAgo, onLike, onComment, setVideos }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isPhotoLiked = () => {
    return Array.isArray(photo.likes) && photo.likes.includes(currentUser?._id);
  };

  const handleLike = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error('Please login to like photos');
      return;
    }

    onLike(photo._id);
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    onComment(photo._id, comment, setComment);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
    >
      {/* Photo Creator Info */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${photo.user?._id}`} className="flex items-center space-x-3">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={photo.user?.profilePicture || '/default-avatar.png'}
            alt={photo.user?.username || 'User'}
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <h3 className="font-semibold">{photo.user?.username || 'Anonymous'}</h3>
            <p className="text-sm text-gray-500">
              {photo.createdAt ? formatTimeAgo(photo.createdAt) : 'Recently'}
            </p>
          </div>
        </Link>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-500 hover:text-gray-700"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Photo Display */}
      <div className="relative aspect-video bg-black">
        <img
          src={photo.videoUrl || photo.thumbnailUrl}
          alt={photo.title || "Photo"}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Interaction Buttons */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center space-x-2 cursor-pointer ${
              isPhotoLiked() ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart
              className="w-6 h-6"
              fill={isPhotoLiked() ? "currentColor" : "none"}
            />
            <span>{Array.isArray(photo.likes) ? photo.likes.length : 0}</span>
          </button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600"
          >
            <MessageCircle className="w-6 h-6" />
            <span>{photo.comments?.length || 0}</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 text-gray-600"
          >
            <Send className="w-6 h-6" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 text-gray-600"
          >
            <BookMarked className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Description */}
        <h3 className="font-medium text-gray-800 mb-2">{photo.title}</h3>
        <p className="text-gray-600 text-sm">{photo.description}</p>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 border-t pt-4 overflow-hidden"
            >
              <form onSubmit={handleComment} className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-full"
                  disabled={!comment.trim()}
                >
                  Post
                </motion.button>
              </form>

              <div className="space-y-4 max-h-60 overflow-y-auto">
                {photo.comments?.map((comment, index) => (
                  <motion.div 
                    key={comment._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex space-x-3"
                  >
                    <img
                      src={comment.user?.profilePicture || '/default-avatar.png'}
                      alt={comment.user?.username || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{comment.user?.username || 'User'}</p>
                        <p className="text-xs text-gray-500">
                          {comment.createdAt ? formatTimeAgo(comment.createdAt) : 'Just now'}
                        </p>
                      </div>
                      <p className="text-gray-600">{comment.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PhotoCard;
