import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  variant?: 'transparent' | 'solid';
  showBookButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ variant = 'solid', showBookButton = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isTransparent = variant === 'transparent';
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (variant === 'transparent') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [variant]);

  const scrollToSection = (id: string) => {
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMenuOpen(false);
    } else {
      navigate(`/#${id}`);
      setIsMenuOpen(false);
    }
  };

  const handleBookClick = () => {
    if (!isHomePage) {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const getTextColor = () => {
    if (isTransparent) {
      return isScrolled ? 'text-slate-600 hover:text-amber-600' : 'text-white/80 hover:text-white';
    }
    return 'text-slate-600 hover:text-amber-600';
  };

  const getIconColor = () => {
    if (isTransparent) {
      return isScrolled ? 'text-slate-800' : 'text-white';
    }
    return 'text-slate-800';
  };

  const getNavBg = () => {
    if (isTransparent) {
      return isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent';
    }
    return 'bg-white/95 backdrop-blur-md shadow-lg';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${getNavBg()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg hidden sm:block ${
              isTransparent && !isScrolled ? 'text-white' : 'text-slate-800'
            }`}>
              Build Wealth Through Property
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['About', 'Speakers', 'Includes', 'FAQ'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`font-medium transition-colors ${getTextColor()}`}
              >
                {item}
              </button>
            ))}
            {showBookButton && (
              <button
                onClick={handleBookClick}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
              >
                Book Now — £25
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 ${getIconColor()}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {['About', 'Speakers', 'Includes', 'FAQ'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="block w-full text-left px-4 py-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                {item}
              </button>
            ))}
            {showBookButton && (
              <button
                onClick={handleBookClick}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold"
              >
                Book Now — £25
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;

