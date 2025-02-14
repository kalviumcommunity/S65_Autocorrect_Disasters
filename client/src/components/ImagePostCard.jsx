import React from 'react';

const ImagePostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Image */}
      <img
        src={post.imageUrl}
        alt={post.caption}
        className="w-full aspect-square object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-2">{post.timestamp}</p>
        <p className="mb-2">{post.caption}</p>
        <div className="flex items-center gap-2">
          <button className="text-red-500 hover:text-red-600">♥</button>
          <span className="text-sm text-gray-600">{post.likes} likes</span>
        </div>
      </div>
    </div>
  );
};

export default ImagePostCard;