import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Users, 
  BookOpen, 
  Heart, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Star,
  Gift,
  Target,
  Briefcase,
  Home,
  TrendingUp,
  Lock,
  Mail,
  User,
  Loader2
} from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import FAQAccordion from './FAQAccordion';
import PanelCard from './PanelCard';
import ReasonCard from './ReasonCard';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { submitReasonsUnlockLead } from '@/lib/leads';

// Image URLs
const images = {
  host: './profile.jpg',
  book: './marketing.jpg',
  venue: 'https://www.europahotelbelfast.com/wp-content/uploads/2021/10/exterior_europa-hotel-376.jpg',
  chrisDolan: './dolan.jpg',
  lewisMills: './lewis.jpg',
  nickNicolaou: './nick.jpg',
  adeniyiZacchaeus: './adeniyi.jpg',
  accountant: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096290851_eaec5242.png',
  charity: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096316988_a7dbb4e1.jpg',
  hero: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096345107_b9d52d49.png',
};

const panelists = [
  {
    name: 'Chris Dolan',
    role: 'Estate Agent',
    image: images.chrisDolan,
    description: 'Expert insights on buying and selling in the current market, property valuations, and market trends. Helps clients navigate listings and make informed decisions.'
  },
  {
    name: 'Lewis Mills',
    role: 'Mortgage Adviser',
    image: images.lewisMills,
    description: 'Belfast-based mortgage adviser for first-time buyers and buy-to-let investors. Expert guidance on affordability, rates, and financing strategies across the UK.'
  },
  {
    name: 'Nick Nicolaou',
    role: 'Estate Agent',
    image: images.nickNicolaou,
    description: 'Expert insights on buying and selling in the current market, property valuations, and market trends. Helps clients navigate listings and make informed decisions.'
  },
  {
    name: 'Adeniyi Zacchaeus',
    role: 'Accountant',
    image: images.adeniyiZacchaeus,
    description: 'Expert guidance on property investment tax, structuring finances, and maximising returns. Helps investors plan and optimise their portfolio for long-term growth.'
  },
];

const reasons = [
  {
    title: 'Multiple Pathways to Wealth',
    description: "Property isn't one strategy — it's a system with options that create resilience and choice."
  },
  {
    title: 'Predictable, Repeatable Income',
    description: 'Rental income provides steady cash flow and long-term financial stability.'
  },
  {
    title: 'Leverages "Other People\'s Money"',
    description: 'Leverage allows small deposits to control large assets, multiplying returns and accelerating growth.'
  },
  {
    title: 'Reliable Store of Value',
    description: 'Property preserves wealth because land is scarce and demand is constant.'
  },
  {
    title: 'Appreciates Over Time',
    description: 'Property is one of the strongest appreciating assets, driven by supply, demand, and economic factors.'
  },
  {
    title: 'Powerful Hedge Against Inflation',
    description: 'As the cost of living rises, property protects purchasing power and makes debt cheaper in real terms.'
  },
  {
    title: 'Significant Tax Advantages',
    description: 'Governments encourage property ownership through various tax benefits and incentives.'
  },
];

const whatYouWillLearn = [
  'Navigating buying and selling property in today\'s market',
  'Understanding mortgage affordability and interest-rate risks',
  'Real-life property investing experiences — lessons from successes and challenges',
  'The legal responsibilities every landlord should understand, including eviction realities',
  'Tax planning and structuring your property portfolio effectively',
  'Strategies for building a sustainable long-term property portfolio',
];

const ticketIncludes = [
  'Full 3-hour property wealth seminar',
  'Expert panel discussion with industry professionals',
  'Live audience Q&A session',
  'Free downloadable investor tools and checklists',
  'Opportunity to purchase the book and support charity',
  'Networking with like-minded investors',
];

const audienceTypes = [
  {
    icon: Target,
    title: 'First-Time Investors',
    description: 'Those looking to make their first property investment with confidence.'
  },
  {
    icon: Briefcase,
    title: 'Professionals',
    description: 'Career professionals considering property as a wealth-building strategy.'
  },
  {
    icon: Home,
    title: 'Small Landlords',
    description: 'Existing landlords seeking better systems, planning, and risk awareness.'
  },
  {
    icon: TrendingUp,
    title: 'Wealth Builders',
    description: 'Anyone interested in long-term financial security through property.'
  },
];

const REASONS_UNLOCKED_KEY = 'reasons_unlocked';

const AppLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [reasonsUnlocked, setReasonsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(REASONS_UNLOCKED_KEY) === 'true';
  });
  const [unlockName, setUnlockName] = useState('');
  const [unlockEmail, setUnlockEmail] = useState('');
  const [unlockSubmitting, setUnlockSubmitting] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Track landing page view once per visit
  useEffect(() => {
    try {
      trackPageView('Home', window.location.pathname || '/');
    } catch (e) {
      // analytics is non-critical; fail silently
    }
  }, []);
  
  // Handle hash navigation from other pages
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, []);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = unlockName.trim();
    const email = unlockEmail.trim().toLowerCase();
    if (!name || !email) {
      setUnlockError('Please enter your name and email.');
      return;
    }
    setUnlockError(null);
    setUnlockSubmitting(true);
    try {
      await submitReasonsUnlockLead(name, email);
      localStorage.setItem(REASONS_UNLOCKED_KEY, 'true');
      setReasonsUnlocked(true);
      setUnlockName('');
      setUnlockEmail('');
    } catch (err) {
      console.error('Unlock submit error:', err);
      setUnlockError('Something went wrong. Please try again.');
    } finally {
      setUnlockSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg hidden sm:block ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                Build Wealth Through Property
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['About', 'Speakers', 'Includes', 'FAQ'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`font-medium transition-colors ${
                    isScrolled ? 'text-slate-600 hover:text-amber-600' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
              <Link
                to="/book"
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isScrolled ? 'text-slate-600 hover:text-amber-600' : 'text-white/80 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Buy Book
              </Link>
              <Link
                to="/booking"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
              >
                Book Now — £25
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 ${isScrolled ? 'text-slate-800' : 'text-white'}`}
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
              <Link
                to="/book"
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold text-center block flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Buy Book
              </Link>
              <Link
                to="/booking"
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold text-center block"
              >
                Book Now — £25
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src={images.hero} 
            alt="Property Investment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 mb-6">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 text-sm font-medium">Saturday, 14 March 2026 • Belfast</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                How Ordinary People Are Building Wealth Through Property — Even Without Large Savings
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join property investor <strong className="text-white">Chris Ifonlaja</strong> and other property experts for a live seminar revealing the strategies used to start and scale a property portfolio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/booking"
                  onClick={() => trackEvent('home_book_cta_click')}
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Book Your Seat
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/book"
                  onClick={() => trackEvent('home_book_page_cta_click')}
                  className="group w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Buy the Book
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Countdown Timer */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-amber-300 text-sm font-medium mb-2 text-center">Event Starts In</p>
                <CountdownTimer />
                <p className="text-amber-200 text-sm font-medium mt-4 text-center">Limited seats available for this seminar.</p>
              </div>
            </div>
            
            {/* Event Details Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <img 
                  src={images.book} 
                  alt="Build Wealth Through Property - 7 Reasons Why"
                  className="w-48 mx-auto mb-6 rounded-lg shadow-2xl"
                  loading="lazy"
                />
                <div className="text-center mb-6">
                  <p className="text-white font-semibold text-lg mb-2">Available Now</p>
                  <p className="text-slate-300 text-sm mb-4">Purchase the book at the event or online</p>
                  <Link
                    to="/book"
                    className="px-6 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-white rounded-lg font-semibold text-sm transition-all inline-block"
                  >
                    Buy the Book - £19.99
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="font-semibold">Saturday, 14 March 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Time</p>
                      <p className="font-semibold">2:00 PM – 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Venue</p>
                      <p className="font-semibold">Europa Hotel, Great Victoria Street, Belfast BT2 7AP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Capacity</p>
                      <p className="font-semibold">Limited Seats Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Event Details Mobile */}
      <section className="lg:hidden bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <Calendar className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Date</p>
              <p className="font-semibold text-slate-800 text-sm">Sat, 14 March</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <Clock className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Time</p>
              <p className="font-semibold text-slate-800 text-sm">2:00 – 5:00 PM</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <MapPin className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Venue</p>
              <p className="font-semibold text-slate-800 text-sm">Europa Hotel, Great Victoria Street, Belfast BT2 7AP</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <Ticket className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Price</p>
              <p className="font-semibold text-slate-800 text-sm">£25 per ticket</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn At This Seminar */}
      <section id="about" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              What You'll Learn
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              What You'll Learn At This Seminar
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              A practical, experience-based session covering the essentials of property investing — from market know-how to tax and legal realities.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {whatYouWillLearn.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
                <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          {/* 7 Reasons - Lead gen */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">The 7 Core Reasons Property Builds Wealth</h3>
            <p className="text-slate-600">These principles are explored in the book and at the seminar.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.slice(0, 3).map((reason, index) => (
              <ReasonCard key={index} number={index + 1} title={reason.title} description={reason.description} />
            ))}
            {!reasonsUnlocked ? (
              <div className="md:col-span-2 lg:col-span-3 flex justify-center">
                <div className="w-full max-w-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Lock className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Unlock 4 More Reasons</h3>
                      <p className="text-slate-600 text-sm">Enter your details to see all 7 reasons</p>
                    </div>
                  </div>
                  <form onSubmit={handleUnlockSubmit} className="max-w-md mx-auto space-y-4">
                    {unlockError && (
                      <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{unlockError}</p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={unlockName}
                          onChange={(e) => setUnlockName(e.target.value)}
                          placeholder="Your name"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          value={unlockEmail}
                          onChange={(e) => setUnlockEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={unlockSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {unlockSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Unlock 4 More Reasons
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <>
                {reasons.slice(3, 7).map((reason, index) => (
                  <ReasonCard key={index + 3} number={index + 4} title={reason.title} description={reason.description} />
                ))}
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
                    <p className="text-slate-300 text-lg mb-4">
                      Each principle is explained using real-life experience — including mistakes, lessons learned, and practical examples.
                    </p>
                    <p className="text-amber-400 font-semibold">
                      This is not a get-rich-quick talk. It is a grounded, experience-based session.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About the Host */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
              <img 
                src={images.host}
                alt="Chris Ifonlaja"
                className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            
            <div>
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
                Your Host
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                Chris Ifonlaja
              </h2>
              <p className="text-amber-600 font-semibold text-lg mb-6">
                Property Investor & Author
              </p>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Chris is a property investor, community leader, and author of <em className="text-slate-800 font-medium">Build Wealth Through Property: 7 Reasons Why</em>. His journey includes both successful investments and difficult seasons shaped by market downturns, tenant challenges, and financing pressures.
                </p>
                <p>
                  Through this seminar and his book, Chris shares not only strategies, but also the importance of stewardship, discipline, and long-term thinking in building wealth that lasts. Proceeds from the event support Place of Victory charity's community hub building project.
                </p>
                <p>
                  His wider mission is to combine financial education with community transformation, helping individuals grow while also strengthening the communities around them.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/booking"
                  className="group px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Book Your Seat
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/book"
                  className="group px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Purchase the Book
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  £19.99
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-700 font-medium">Published Author</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                  <Home className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-700 font-medium">Active Investor</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2">
                  <Heart className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-700 font-medium">Community Leader</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Panel */}
      <section id="speakers" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              Expert Panel
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              Learn From Industry Professionals
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Following the main talk, attendees will hear from a panel of local property professionals who bring practical insight from different stages of the property journey.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {panelists.map((panelist, index) => (
              <PanelCard key={index} {...panelist} />
            ))}
          </div>
        </div>
      </section>

      {/* What Your Ticket Includes */}
      <section id="includes" className="py-20 sm:py-28 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-4">
                What's Included
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Your £25 Ticket Gives You Access To
              </h2>
              <div className="space-y-4">
                {ticketIncludes.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30"
                >
                  <Ticket className="w-5 h-5" />
                  Book Your Seat Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Buy the Book
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={images.venue}
                alt="Europa Hotel"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent rounded-2xl" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Venue</p>
                <p className="text-white font-semibold text-lg">Europa Hotel</p>
                <p className="text-slate-300">Great Victoria Street, Belfast BT2 7AP</p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Bonus for Seminar Attendees */}
      <section id="book" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
              <img 
                src={images.book} 
                alt="Build Wealth Through Property Book"
                className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            
            <div>
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
                Bonus for Seminar Attendees
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
                What You Receive When You Attend
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  All seminar attendees will receive a digital copy of the opening chapter from Chris Ifonlaja's book <em className="text-slate-800 font-medium">Build Wealth Through Property: 7 Reasons Why</em>. This chapter introduces the foundational principles behind property wealth building and provides a practical starting point for anyone looking to understand how property can form part of a long-term financial strategy.
                </p>
                <p>
                  Attendees will also receive a practical investor resource:
                </p>
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <p className="font-semibold text-slate-800 mb-1">Practical Checklist</p>
                  <p className="text-slate-700">
                    &ldquo;7 Questions to Ask Before Buying Your First Property&rdquo; — a simple framework to help you evaluate potential property investments.
                  </p>
                </div>
                <p className="text-slate-600 text-sm">
                  These materials will be available for you to take away on the day. No sign-up required.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
                >
                  <Ticket className="w-5 h-5" />
                  Book Your Seat
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-200 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Buy the Book — £19.99
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Section */}
      <section className="py-20 sm:py-28 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={images.charity}
                alt="Place of Victory Charity"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                <Heart className="w-4 h-4" />
                Charity & Community Impact
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
                Supporting Place of Victory Charity
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  This event also supports <strong className="text-slate-800">Place of Victory Charity</strong>.
                </p>
                <p className="text-lg">
                  <strong className="text-rose-600">Event proceeds help support Place of Victory Charity</strong>, in securing a permanent community location to serve families, young people, and outreach programmes.
                </p>
                <p>
                  By attending, you are investing in your own financial education while supporting long-term community development.
                </p>
              </div>
              <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-rose-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                    <Gift className="w-7 h-7 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Supporting Community</p>
                    <p className="text-slate-600">Event supports Place of Victory Charity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Attend */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              Who Should Attend
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              This Seminar Is Perfect For
            </h2>
            <p className="text-slate-600 text-lg">
              No prior property investment experience is required.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audienceTypes.map((type, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{type.title}</h3>
                <p className="text-slate-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Learn How Property Investors Build Wealth?
          </h2>
          <p className="text-xl text-slate-300 mb-4">
            Join us for a live seminar designed to help you better understand property investing and the principles behind building long-term wealth.
          </p>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Whether you are just starting your property journey or looking to invest more wisely, this seminar will provide practical insights, real experiences, and clear next steps while also supporting a meaningful community cause.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/booking"
              className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3"
            >
              <Ticket className="w-6 h-6" />
              Book Your Seat
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/book"
              className="group px-10 py-5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              Buy the Book
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Saturday, 14 March 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>2:00 PM – 5:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <span>Belfast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="bg-slate-100 border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-600 text-sm">
            This website is for informational purposes only. Investment decisions carry risk.{' '}
            <Link to="/disclaimer" className="text-amber-600 hover:text-amber-700 font-semibold underline">
              Read full disclaimer
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppLayout;
