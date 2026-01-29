import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (id: string) => {
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <footer className="bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Build Wealth Through Property</span>
            </div>
            <p className="text-slate-400 text-sm">
              A practical seminar on building long-term wealth through property investment.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Event Details</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Friday, 14 March 2026
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                2:00 PM – 4:00 PM
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Whitla Hall, Methodist College Belfast
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Speakers', 'Includes', 'FAQ'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-slate-400 hover:text-amber-500 text-sm transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {item}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/disclaimer"
                  className="text-slate-400 hover:text-amber-500 text-sm transition-colors flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-slate-500 text-sm">
              © 2026 Build Wealth Through Property. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              This website is for informational purposes only. Investment decisions carry risk.{' '}
              <Link to="/disclaimer" className="text-amber-500 hover:text-amber-400 underline">
                Read full disclaimer
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/disclaimer"
              className="text-slate-500 hover:text-amber-500 text-sm transition-colors"
            >
              Disclaimer
            </Link>
            <button className="text-slate-500 hover:text-amber-500 text-sm transition-colors">
              Privacy Policy
            </button>
            <button className="text-slate-500 hover:text-amber-500 text-sm transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

