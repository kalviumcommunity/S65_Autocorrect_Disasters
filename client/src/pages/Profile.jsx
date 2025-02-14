import { useState, useEffect } from "react";
import ImagePostCard from "../components/ImagePostCard"; // Corrected import

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulated fetch of user data and posts
        const userData = {
          name: "Jane Smith",
          username: "@janesmith",
          profileImage: "/api/placeholder/150/150",
          postsCount: 42,
          followersCount: 1234,
          followingCount: 567,
        };

        const postsData = [
          {
            id: 1,
            imageUrl: "/api/placeholder/400/400",
            caption: "Beautiful sunset at the beach",
            likes: 124,
            timestamp: "2h ago",
          },
          {
            id: 2,
            imageUrl: "/api/placeholder/400/400",
            caption: "Coffee and code",
            likes: 89,
            timestamp: "5h ago",
          },
        ];

        setUser(userData);
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src={user?.profileImage}
          alt={`Profile picture of ${user?.name}`}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-600">{user?.username}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span>
              <strong>{user?.postsCount}</strong> posts
            </span>
            <span>
              <strong>{user?.followersCount}</strong> followers
            </span>
            <span>
              <strong>{user?.followingCount}</strong> following
            </span>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <ImagePostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
