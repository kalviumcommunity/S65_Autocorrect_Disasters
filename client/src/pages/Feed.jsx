import { useState, useEffect } from "react";
import { Image, Heart, MessageCircle, Send, X, Upload, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    const [newPost, setNewPost] = useState({
        title: "",
        description: "",
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/users/status', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setIsAuthenticated(response.ok && data.authenticated);
        } catch (err) {
            console.error("Auth check failed:", err);
            setIsAuthenticated(false);
        } finally {
            setAuthChecking(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/posts?page=${page}&limit=10`);

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Response is not JSON");
            }

            const data = await response.json();

            if (page === 1) {
                setPosts(data.data);
            } else {
                setPosts((prevPosts) => [...prevPosts, ...data.data]);
            }

            setHasMore(data.pagination.currentPage < data.pagination.pages);
            setLoading(false);
        } catch (err) {
            setError(`Failed to fetch posts: ${err.message}`);
            setLoading(false);
        }
    };

    const handleAuthError = (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setIsAuthenticated(false);
            setError("Please log in to perform this action");
        } else {
            setError(err.message || "An error occurred");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPost({ ...newPost, image: file });

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setError("Please log in to create a post");
            return;
        }

        if (!newPost.title || !newPost.image) {
            setError("Title and image are required");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("title", newPost.title);
            formData.append("description", newPost.description);
            formData.append("image", newPost.image);

            const response = await fetch("/posts", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to create post: ${response.status}`);
            }

            const data = await response.json();

            setPosts((prevPosts) => [data.data, ...prevPosts]);

            setNewPost({ title: "", description: "", image: null });
            setImagePreview(null);
            setShowCreateModal(false);
            setUploading(false);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                handleAuthError(err);
            } else {
                setError(err.message);
            }
            setUploading(false);
        }
    };

    const handleLike = async (postId, isLiked) => {
        if (!isAuthenticated) {
            setError("Please log in to like posts");
            return;
        }

        try {
            const endpoint = isLiked ? `/posts/${postId}/unlike` : `/posts/${postId}/like`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Request failed: ${response.status}`);
            }

            const data = await response.json();

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, likes: data.data, isLikedByUser: !isLiked } : post
                )
            );
        } catch (err) {
            handleAuthError(err);
        }
    };

    const handleCommentSubmit = async (postId) => {
        if (!isAuthenticated) {
            setError("Please log in to comment");
            return;
        }

        if (!commentText.trim()) return;

        try {
            const response = await fetch(`/posts/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: commentText }),
                credentials: "include"
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to add comment: ${response.status}`);
            }

            const data = await response.json();

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, comments: data.data } : post
                )
            );

            setCommentText("");
            setActiveCommentPost(null);
        } catch (err) {
            handleAuthError(err);
        }
    };

    const loadMorePosts = () => {
        if (!loading && hasMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const isPostLiked = (post) => {
        return post?.likes?.includes(post._id) || false;
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = window.innerHeight;

            if (scrollTop + clientHeight >= scrollHeight - 200 && !loading && hasMore) {
                loadMorePosts();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    const handleLoginRedirect = () => {
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            {/* Header */}
            <header className="sticky top-0 bg-black bg-opacity-90 backdrop-blur-sm z-10 border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">FailFeed</h1>
                    <div className="flex items-center space-x-4">
                        {authChecking ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                        ) : isAuthenticated ? (
                            <motion.button
                                className="bg-white text-black p-3 rounded-full"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus className="w-5 h-5" />
                            </motion.button>
                        ) : (
                            <motion.button
                                className="bg-white text-black px-4 py-2 rounded-full font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLoginRedirect}
                            >
                                Log In
                            </motion.button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Feed */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-900 text-white px-4 py-3 rounded mb-6 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {posts.length === 0 && !loading ? (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold mb-4">No posts yet</h2>
                        <p className="text-gray-400 mb-8">Be the first to share an autocorrect fail!</p>
                        {isAuthenticated ? (
                            <motion.button
                                className="bg-white text-black px-6 py-3 rounded-full font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Post
                            </motion.button>
                        ) : (
                            <motion.button
                                className="bg-white text-black px-6 py-3 rounded-full font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLoginRedirect}
                            >
                                Log In to Post
                            </motion.button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {posts.map((post) => (
                            <motion.div
                                key={post._id}
                                className="bg-gray-900 rounded-xl overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Post header */}
                                <div className="p-4 flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {post.user?.avatar ? (
                                            <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold">{post.user?.name?.charAt(0) || "U"}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{post.user?.name || "Unknown User"}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Post image */}
                                <div className="relative aspect-square bg-gray-800">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Post content */}
                                <div className="p-4">
                                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                                    {post.description && (
                                        <p className="text-gray-300 mb-4">{post.description}</p>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => handleLike(post._id, isPostLiked(post))}
                                        >
                                            <Heart
                                                className={`w-6 h-6 ${
                                                    isPostLiked(post) ? "fill-red-500 text-red-500" : "text-white"
                                                }`}
                                            />
                                            <span>{post.likes?.length || 0}</span>
                                        </button>
                                        <button
                                            className="flex items-center space-x-1"
                                            onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                                        >
                                            <MessageCircle className="w-6 h-6" />
                                            <span>{post.comments?.length || 0}</span>
                                        </button>
                                    </div>

                                    {/* Comments section */}
                                    {activeCommentPost === post._id && (
                                        <div className="border-t border-gray-800 pt-4">
                                            <h3 className="font-bold mb-3">Comments</h3>
                                            {post.comments?.length > 0 ? (
                                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                                    {post.comments.map((comment) => (
                                                        <div key={comment._id} className="flex space-x-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                                {comment.avatar ? (
                                                                    <img src={comment.avatar} alt={comment.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-sm font-bold">{comment.name?.charAt(0) || "U"}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 bg-gray-800 rounded-lg p-2">
                                                                <p className="text-sm font-medium">{comment.name}</p>
                                                                <p className="text-sm">{comment.text}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {new Date(comment.date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-sm mb-4">No comments yet</p>
                                            )}

                                            {/* Comment form */}
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder={isAuthenticated ? "Add a comment..." : "Log in to comment"}
                                                    className="flex-1 bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    disabled={!isAuthenticated}
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && isAuthenticated) {
                                                            handleCommentSubmit(post._id);
                                                        }
                                                    }}
                                                />
                                                {isAuthenticated ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-white text-black p-2 rounded-full"
                                                        onClick={() => handleCommentSubmit(post._id)}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-white text-black p-2 rounded-full"
                                                        onClick={handleLoginRedirect}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <div className="text-center py-8">
                                <div className="inline-block w-8 h-8 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
                            </div>
                        )}

                        {!loading && hasMore && (
                            <div className="text-center py-8">
                                <motion.button
                                    className="bg-gray-800 text-white px-6 py-2 rounded-full"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={loadMorePosts}
                                >
                                    Load More
                                </motion.button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20 px-4">
                    <motion.div
                        className="bg-gray-900 rounded-xl w-full max-w-lg overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold">Create Post</h2>
                            <button
                                className="text-gray-400 hover:text-white"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewPost({ title: "", description: "", image: null });
                                    setImagePreview(null);
                                }}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="p-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white"
                                    placeholder="Enter a catchy title"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    className="w-full bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-white"
                                    placeholder="Add some context to your fail (optional)"
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Image *</label>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-contain bg-gray-800 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 p-1 rounded-full"
                                            onClick={() => {
                                                setNewPost({ ...newPost, image: null });
                                                setImagePreview(null);
                                            }}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-full h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 cursor-pointer">
                                        <label className="flex flex-col items-center cursor-pointer">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-sm">Click to upload image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    type="button"
                                    className="px-4 py-2 rounded-lg bg-transparent border border-gray-600 text-white"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewPost({ title: "", description: "", image: null });
                                        setImagePreview(null);
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-white text-black font-medium disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={uploading || !newPost.title || !newPost.image}
                                >
                                    {uploading ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        "Post"
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Feed;