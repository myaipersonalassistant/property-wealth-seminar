import React from 'react';

interface PanelCardProps {
  name: string;
  role: string;
  image: string;
  description: string;
}

const PanelCard: React.FC<PanelCardProps> = ({ name, role, image, description }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-amber-300 font-medium">{role}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default PanelCard;
