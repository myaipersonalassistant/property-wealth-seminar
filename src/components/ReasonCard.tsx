import React from 'react';
import { 
  Compass, 
  Banknote, 
  Scale, 
  Shield, 
  TrendingUp, 
  Umbrella, 
  Calculator
} from 'lucide-react';

interface ReasonCardProps {
  number: number;
  title: string;
  description: string;
}

const icons = [Compass, Banknote, Scale, Shield, TrendingUp, Umbrella, Calculator];

const ReasonCard: React.FC<ReasonCardProps> = ({ number, title, description }) => {
  const Icon = icons[number - 1] || Compass;
  
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Reason {number}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ReasonCard;
