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
  ChevronRight,
  Star,
  Download,
  MessageCircle,
  Gift,
  Target,
  Briefcase,
  Home,
  TrendingUp,
  XCircle
} from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import FAQAccordion from './FAQAccordion';
import PanelCard from './PanelCard';
import ReasonCard from './ReasonCard';
import TicketModal from './TicketModal';
import PaymentSuccess from './PaymentSuccess';

// Image URLs
const images = {
  host: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096021984_e5a60e10.jpg',
  book: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096042346_3741c746.jpg',
  venue: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096061879_b13955d3.jpg',
  chrisDolan: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096087877_ca812ae1.jpg',
  lewisMills: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096105352_c9c5ee9c.jpg',
  ruth: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096246566_9c2b8eef.jpg',
  raymond: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096270790_4b94378e.png',
  accountant: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096290851_eaec5242.png',
  charity: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096316988_a7dbb4e1.jpg',
  hero: 'https://d64gsuwffb70l.cloudfront.net/697242eb29a6a04fc9873637_1769096345107_b9d52d49.png',
};

const panelists = [
  {
    name: 'Chris Dolan',
    role: 'Estate Agent',
    image: images.chrisDolan,
    description: 'Expert insights on buying and selling in the current market, property valuations, and market trends.'
  },
  {
    name: 'Lewis Mills',
    role: 'Mortgage Adviser',
    image: images.lewisMills,
    description: 'Guidance on mortgage affordability, interest-rate risk, and financing strategies for investors.'
  },
  {
    name: 'Ruth',
    role: 'Property Investor',
    image: images.ruth,
    description: 'Real-world investing experiences, lessons learned, and practical portfolio building strategies.'
  },
  {
    name: 'Raymond Crooks',
    role: 'Solicitor',
    image: images.raymond,
    description: 'Legal responsibilities, conveyancing processes, and understanding eviction realities.'
  },
  {
    name: 'TBC',
    role: 'Accountant / Tax Specialist',
    image: images.accountant,
    description: 'Tax planning strategies, portfolio structure, and maximising returns through proper accounting.'
  },
];

const reasons = [
  {
    title: 'Property as a Store of Value',
    description: 'Unlike cash that loses purchasing power, property has historically maintained and grown in value over time.'
  },
  {
    title: 'The Impact of Inflation',
    description: 'Understand how inflation affects both your assets and debt, and why property owners often benefit.'
  },
  {
    title: 'Capital Growth & Location',
    description: 'Learn how location dynamics drive property appreciation and how to identify growth areas.'
  },
  {
    title: 'Rental Income & Cash Flow',
    description: 'Discover the realities of generating consistent rental income and managing cash flow effectively.'
  },
  {
    title: 'Responsible Use of Leverage',
    description: 'How to use mortgage financing wisely to amplify returns while managing risk appropriately.'
  },
  {
    title: 'Refinancing & Recycling Capital',
    description: 'Strategies for releasing equity and reinvesting to grow your portfolio sustainably.'
  },
  {
    title: 'The Power of Compounding',
    description: 'How small, consistent investments in property can compound into significant long-term wealth.'
  },
];

const ticketIncludes = [
  'Full 2-hour property wealth seminar',
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

const AppLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Check for payment status in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sid = urlParams.get('session_id');
    const ref = urlParams.get('ref');
    
    if (payment === 'success') {
      setPaymentStatus('success');
      setSessionId(sid);
      setOrderRef(ref);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const handleClosePaymentStatus = () => {
    setPaymentStatus(null);
    setSessionId(null);
    setOrderRef(null);
  };
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
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
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
              >
                Book Now — £10
              </button>
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
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold"
              >
                Book Now — £10
              </button>
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
                <span className="text-amber-200 text-sm font-medium">Friday, 14 March 2026 • Belfast</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Build Wealth Through Property —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">
                  7 Reasons Why
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-4">
                How Real Estate Builds Wealth, Security, and Long-Term Stability
              </p>
              
              <p className="text-slate-400 mb-8 leading-relaxed">
                Join property investor and author <strong className="text-white">Chris Ifonlaja</strong>, alongside a panel of experienced property professionals, for a powerful and practical seminar exploring how ordinary people can use property to build long-term financial security.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Book Your Seat — £10
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Learn More
                </button>
              </div>
              
              {/* Countdown Timer */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-amber-300 text-sm font-medium mb-4 text-center">Event Starts In</p>
                <CountdownTimer />
              </div>
            </div>
            
            {/* Event Details Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <img 
                  src={images.book} 
                  alt="Build Wealth Through Property Book"
                  className="w-48 mx-auto mb-6 rounded-lg shadow-2xl"
                />
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="font-semibold">Friday, 14 March 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Time</p>
                      <p className="font-semibold">2:00 PM – 4:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Venue</p>
                      <p className="font-semibold">Whitla Hall, Methodist College Belfast</p>
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
              <p className="font-semibold text-slate-800 text-sm">Fri, 14 March</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <Clock className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Time</p>
              <p className="font-semibold text-slate-800 text-sm">2:00 – 4:00 PM</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <MapPin className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Venue</p>
              <p className="font-semibold text-slate-800 text-sm">Whitla Hall, Belfast</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <Ticket className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-xs text-slate-500">Price</p>
              <p className="font-semibold text-slate-800 text-sm">£10 per ticket</p>
            </div>
          </div>
        </div>
      </section>

      {/* About the Seminar */}
      <section id="about" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              About the Seminar
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              The 7 Core Reasons Property Builds Wealth
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Property remains one of the most reliable ways to build long-term wealth, but real success depends on understanding how income, growth, finance, tax, and risk all work together over time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <ReasonCard 
                key={index}
                number={index + 1}
                title={reason.title}
                description={reason.description}
              />
            ))}
            {/* Special 7th card spanning full width on larger screens */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
                <p className="text-slate-300 text-lg mb-4">
                  Each principle is explained using real-world experience — including mistakes, lessons learned, and practical examples — so attendees can apply the ideas responsibly and sustainably.
                </p>
                <p className="text-amber-400 font-semibold">
                  This is not a get-rich-quick talk. It is a grounded, experience-based session.
                </p>
              </div>
            </div>
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
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 hidden sm:block">
                <img 
                  src={images.book}
                  alt="Book Cover"
                  className="w-24 rounded-lg shadow-lg"
                />
              </div>
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
                  Chris is a property investor, community leader, and author of <em className="text-slate-800 font-medium">Build Wealth Through Property — 7 Reasons Why</em>. His journey includes both successful investments and difficult seasons shaped by market downturns, tenant challenges, and financing pressures.
                </p>
                <p>
                  Through this seminar, Chris shares not only strategies, but also the importance of stewardship, discipline, and long-term thinking in building wealth that lasts.
                </p>
                <p>
                  His wider mission is to combine financial education with community transformation, helping individuals grow while also strengthening the communities around them.
                </p>
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
              Following the main teaching session, attendees will hear from a panel of local property professionals who bring practical insight from different stages of the property journey.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {panelists.map((panelist, index) => (
              <PanelCard key={index} {...panelist} />
            ))}
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
              Topics the Panel Will Address
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Buying and selling in the current market',
                'Mortgage affordability and interest-rate risk',
                'Real-world investing experiences',
                'Legal responsibilities and eviction realities',
                'Tax planning and portfolio structure',
                'Building a sustainable property portfolio'
              ].map((topic, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-slate-700">{topic}</span>
                </div>
              ))}
            </div>
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
                Your £10 Ticket Gives You Access To
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
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30 flex items-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                Book Your Seat Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="relative">
              <img 
                src={images.venue}
                alt="Whitla Hall Venue"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent rounded-2xl" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-semibold text-lg">Whitla Hall</p>
                <p className="text-slate-300">Methodist College Belfast</p>
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
                  This event also serves as a <strong className="text-slate-800">charity book launch</strong>.
                </p>
                <p className="text-lg">
                  <strong className="text-rose-600">All proceeds from book sales on the day will be donated to Place of Victory Charity</strong>, in support of securing a permanent community location to serve families, young people, and outreach programmes.
                </p>
                <p>
                  By attending and purchasing the book, you are investing not only in your own financial education, but also in long-term community development.
                </p>
              </div>
              <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-rose-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                    <Gift className="w-7 h-7 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">100% of Book Proceeds</p>
                    <p className="text-slate-600">Go directly to charity</p>
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
            Reserve Your Seat Today
          </h2>
          <p className="text-xl text-slate-300 mb-4">
            Seats are limited and this is a ticketed event.
          </p>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Whether you are just starting your property journey or looking to invest more wisely, this seminar will give you clarity, confidence, and practical next steps — while also supporting a meaningful community cause.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3"
            >
              <Ticket className="w-6 h-6" />
              Book Your Seat Now — £10
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Friday, 14 March 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>2:00 PM – 4:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <span>Belfast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                A practical seminar on building long-term wealth through property investment, hosted by Chris Ifonlaja.
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
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 Build Wealth Through Property. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
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

      {/* Ticket Modal */}
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Payment Success Modal */}
      {paymentStatus === 'success' && (
        <PaymentSuccess 
          sessionId={sessionId} 
          orderRef={orderRef} 
          onClose={handleClosePaymentStatus} 
        />
      )}
      
      {/* Payment Cancelled Modal */}
      {paymentStatus === 'cancelled' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h3>
            <p className="text-slate-600 mb-6">
              Your payment was cancelled. No charges have been made to your account.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleClosePaymentStatus();
                  setIsModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={handleClosePaymentStatus}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
