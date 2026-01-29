import React, { useState } from 'react';
import { 
  Ticket, 
  User, 
  Mail, 
  Phone, 
  Loader2, 
  AlertCircle, 
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '@/lib/stripe';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const ticketPrice = 10;
  const total = quantity * ticketPrice;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };
  
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await createCheckoutSession({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        quantity: quantity,
        ticketPrice: ticketPrice,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      <Header variant="solid" showBookButton={false} />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Event Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Ticket className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Book Your Seat</h2>
                      <p className="text-slate-300 text-sm">Property Investment Seminar</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Date</p>
                        <p className="font-semibold">Friday, 14 March 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Time</p>
                        <p className="font-semibold">2:00 PM – 4:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Venue</p>
                        <p className="font-semibold text-sm">Whitla Hall, Methodist College Belfast</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Price</p>
                        <p className="font-semibold">£10 per ticket</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700">
                    <div className="flex items-start gap-3 text-slate-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p>Full 2-hour property wealth seminar</p>
                    </div>
                    <div className="flex items-start gap-3 text-slate-300 text-sm mt-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p>Expert panel discussion</p>
                    </div>
                    <div className="flex items-start gap-3 text-slate-300 text-sm mt-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p>Live Q&A session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                    Complete Your Booking
                  </h1>
                  <p className="text-slate-600">
                    Fill in your details below to secure your seat at the seminar
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ticket Quantity */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-4">
                      Number of Tickets
                    </label>
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isProcessing}
                        className="w-12 h-12 rounded-xl bg-white text-slate-600 font-bold hover:bg-amber-50 transition-colors disabled:opacity-50 shadow-sm border border-amber-200"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-slate-800 mb-1">{quantity}</div>
                        <div className="text-sm text-slate-600">@ £{ticketPrice} each</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        disabled={isProcessing}
                        className="w-12 h-12 rounded-xl bg-white text-slate-600 font-bold hover:bg-amber-50 transition-colors disabled:opacity-50 shadow-sm border border-amber-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isProcessing}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                          placeholder="John Smith"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isProcessing}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">Confirmation will be sent to this email</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number <span className="text-slate-400 text-xs font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isProcessing}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                          placeholder="+44 7700 900000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Seminar Tickets ({quantity}x)</span>
                        <span className="font-semibold text-slate-800">£{total}.00</span>
                      </div>
                      <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800">Total</span>
                        <span className="text-2xl font-bold text-amber-600">£{total}.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Secure Payment</p>
                      <p>Your payment is processed securely through Stripe. We never store your card details.</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <CreditCard className="w-5 h-5" />
                        Proceed to Secure Payment — £{total}.00
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    By proceeding, you agree to our terms of service. Tickets are non-refundable but transferable.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;

