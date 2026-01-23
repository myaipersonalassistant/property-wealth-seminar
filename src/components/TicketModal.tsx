import React, { useState } from 'react';
import { X, Ticket, User, Mail, Phone, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripe';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
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
      // Call the backend API to create a Stripe checkout session
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
        // Redirect to Stripe Checkout
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
  
  const handleClose = () => {
    setError(null);
    setFormData({ name: '', email: '', phone: '' });
    setQuantity(1);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Book Your Seat</h2>
              <p className="text-slate-300 text-sm">Friday, 14 March 2026</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {/* Ticket Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Tickets
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isProcessing}
                className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                -
              </button>
              <span className="text-2xl font-bold text-slate-800 w-12 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={isProcessing}
                className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                +
              </button>
              <span className="text-slate-500 text-sm">@ £{ticketPrice} each</span>
            </div>
          </div>
          
          {/* Contact Details */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="John Smith"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="john@example.com"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Confirmation will be sent to this email</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number <span className="text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="+44 7700 900000"
                />
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Seminar Tickets ({quantity}x)</span>
              <span className="font-semibold text-slate-800">£{total}.00</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-xl font-bold text-amber-600">£{total}.00</span>
            </div>
          </div>
          
          {/* Secure Payment Notice */}
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
            <CreditCard className="w-4 h-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Proceed to Payment — £{total}.00
              </>
            )}
          </button>
          
          <p className="text-xs text-slate-500 text-center mt-4">
            By proceeding, you agree to our terms of service. Tickets are non-refundable but transferable.
          </p>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
