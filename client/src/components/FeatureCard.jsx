import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors flex flex-col items-center text-center">
      <div className="text-blue-400 mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-6">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;