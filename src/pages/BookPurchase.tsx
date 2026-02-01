import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Globe, 
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Heart,
  Truck,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createBookCheckoutSession } from '@/lib/stripe';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

const BookPurchase: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'amazon' | 'uk' | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);


  const bookPrice = 19.99;
  const bookSubtotal = bookPrice * quantity;
  const ukTotal = bookSubtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateUKForm = (): boolean => {
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
    if (!formData.address.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!formData.postcode.trim()) {
      setError('Please enter your postcode');
      return false;
    }
    return true;
  };

  const handleAmazonPurchase = () => {
    // This would link to Amazon product page
    window.open('https://www.amazon.co.uk', '_blank');
  };

  const handleUKOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUKForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await createBookCheckoutSession({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        postcode: formData.postcode.trim(),
        quantity: quantity,
        bookPrice: bookPrice,
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
            {/* Left Column - Book Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 shadow-xl border-2 border-amber-200">
                  <div className="text-center mb-6">
                    <div className="w-32 h-48 mx-auto mb-4 rounded-lg shadow-2xl overflow-hidden">
                      <img 
                        src="./fina.JPG"
                        alt="Build Wealth Through Property Book"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                      Build Wealth Through Property
                    </h2>
                    <p className="text-amber-700 font-semibold text-sm">7 Reasons Why</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-slate-700 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p>Comprehensive guide to property investment</p>
                    </div>
                    <div className="flex items-start gap-3 text-slate-700 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p>Real-world experience and practical insights</p>
                    </div>
                    <div className="flex items-start gap-3 text-slate-700 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p>7 core principles explained in detail</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-rose-600" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">100% Charity</p>
                        <p className="text-xs text-slate-600">All proceeds support Place of Victory Charity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Options */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                    Purchase the Book
                  </h1>
                  <p className="text-slate-600">
                    Choose how you'd like to get your copy of "Build Wealth Through Property 7 Reasons Why"
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Purchase Options */}
                <div className="space-y-6 mb-8">
                  {/* Amazon Option */}
                  <div
                    onClick={() => setSelectedOption('amazon')}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                      selectedOption === 'amazon'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selectedOption === 'amazon' ? 'bg-amber-500' : 'bg-slate-200'
                      }`}>
                        <Globe className={`w-6 h-6 ${
                          selectedOption === 'amazon' ? 'text-white' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-slate-800">Purchase on Amazon</h3>
                          {selectedOption === 'amazon' && (
                            <CheckCircle2 className="w-6 h-6 text-amber-500" />
                          )}
                        </div>
                        <p className="text-slate-600 mb-4">
                          Buy the book directly from Amazon. Available in both physical and digital formats.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            <span>Fast delivery</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            <span>Prime eligible</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            <span>Secure checkout</span>
                          </div>
                        </div>
                        <button
                          onClick={handleAmazonPurchase}
                          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Buy on Amazon
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* UK Physical Book Option */}
                  <div
                    onClick={() => setSelectedOption('uk')}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                      selectedOption === 'uk'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selectedOption === 'uk' ? 'bg-amber-500' : 'bg-slate-200'
                      }`}>
                        <MapPin className={`w-6 h-6 ${
                          selectedOption === 'uk' ? 'text-white' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">Order Physical Book (UK Only)</h3>
                            <p className="text-sm text-amber-600 font-semibold">Shipping within UK only</p>
                          </div>
                          {selectedOption === 'uk' && (
                            <CheckCircle2 className="w-6 h-6 text-amber-500" />
                          )}
                        </div>
                        <p className="text-slate-600 mb-4">
                          Order a physical copy of the book with UK shipping. All proceeds go to Place of Victory Charity.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Package className="w-4 h-4 text-amber-500" />
                            <span>Physical copy</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span>100% to charity</span>
                          </div>
                        </div>

                        {selectedOption === 'uk' && (
                          <form onSubmit={handleUKOrder} className="mt-6 space-y-4 bg-white rounded-xl p-6 border border-amber-200">
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
                              <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  className="w-10 h-10 bg-white border-2 border-amber-300 rounded-lg font-semibold text-amber-600 hover:bg-amber-50 transition-all"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={quantity}
                                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-16 px-3 py-2 text-center border-2 border-amber-300 rounded-lg font-semibold text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                  className="w-10 h-10 bg-white border-2 border-amber-300 rounded-lg font-semibold text-amber-600 hover:bg-amber-50 transition-all"
                                >
                                  +
                                </button>
                                <span className="text-slate-600">Books @ £{bookPrice.toFixed(2)} each</span>
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                  placeholder="John Smith"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                  placeholder="john@example.com"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                placeholder="+44 7700 900000"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Address <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                placeholder="123 Main Street"
                                required
                              />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  City <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="city"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                  placeholder="London"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Postcode <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="postcode"
                                  value={formData.postcode}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                  placeholder="SW1A 1AA"
                                  required
                                />
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-600">{quantity}x Book @ £{bookPrice.toFixed(2)}</span>
                                <span className="font-semibold text-slate-800">£{bookSubtotal.toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">100% of book proceeds go to charity</p>
                              <div className="pt-2 border-t border-slate-300 flex justify-between items-center">
                                <span className="font-bold text-slate-800">Total</span>
                                <span className="text-xl font-bold text-amber-600">£{ukTotal.toFixed(2)}</span>
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={isProcessing}
                              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Redirecting to checkout...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-5 h-5" />
                                  Proceed to Payment — £{ukTotal.toFixed(2)}
                                </>
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can also purchase the book at the event on Friday, 14 March 2026. 
                    All proceeds from event sales go directly to Place of Victory Charity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookPurchase;

