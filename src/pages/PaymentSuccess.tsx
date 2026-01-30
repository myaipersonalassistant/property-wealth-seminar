import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Ticket, 
  BookOpen,
  ArrowRight,
  Home,
  Download,
  Sparkles,
  Gift,
  Heart
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTicketPurchase } from '@/lib/google-sheets';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderDetails {
  customer_name: string;
  customer_email: string;
  quantity: number;
  amount_total: number;
  order_reference: string;
  product_type?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postcode?: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const orderRef = searchParams.get('order_ref') || searchParams.get('ref') || searchParams.get('orderRef');
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');
  const isBookPurchase = orderRef?.startsWith('BOOK-');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderRef) {
        try {
          // Small delay to allow webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          const data = await getTicketPurchase(orderRef);
          if (data) {
            console.log('Order fetched successfully:', data);
            setOrderDetails(data);
            setFetchError(null);
          } else {
            throw new Error('Order not found');
          }
        } catch (err) {
          console.error('Error fetching order:', err);
          setFetchError(err instanceof Error ? err.message : 'Failed to fetch order details');
          
          // Set default values based on order type for display purposes
          if (isBookPurchase) {
            setOrderDetails({
              customer_name: 'Guest',
              customer_email: 'Not yet confirmed',
              quantity: 1,
              amount_total: 2999, // £29.99 in cents
              order_reference: orderRef,
              product_type: 'book',
            });
          } else {
            // For tickets, we don't know the exact quantity, so show a generic message
            setOrderDetails({
              customer_name: 'Guest',
              customer_email: 'Not yet confirmed',
              quantity: 1,
              amount_total: 2500, // £25.00 in cents (1 ticket placeholder)
              order_reference: orderRef,
            });
          }
        }
      }
      setIsLoading(false);
    };

    fetchOrderDetails();
    
    // Confetti effect
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [orderRef, isBookPurchase]);

  const isTicketPurchase = !isBookPurchase;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
        <Header variant="solid" showBookButton={false} />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Confirming your order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          ))}
        </div>
      )}

      <Header variant="solid" showBookButton={false} />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Hero Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
              {isBookPurchase ? 'Order Confirmed!' : 'Booking Confirmed!'}
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              {isBookPurchase 
                ? 'Your book is on its way!' 
                : 'Your tickets have been secured'}
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Payment Successful
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 mb-8 border-2 border-green-100">
            {fetchError && (
              <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                <p className="text-sm text-amber-700">
                  <strong>Note:</strong> {fetchError}. {isBookPurchase ? 'Showing expected order details.' : 'Your ticket details are being confirmed.'} Please check your email for confirmation.
                </p>
              </div>
            )}
            {/* Order Reference */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 mb-8 text-center border-2 border-amber-200">
              <p className="text-sm text-amber-700 font-semibold mb-2 uppercase tracking-wide">Order Reference</p>
              <p className="font-mono text-3xl font-bold text-amber-900">
                {orderRef || orderDetails?.order_reference || 'BWP-XXXXXXXX'}
              </p>
              <p className="text-xs text-amber-600 mt-2">Save this reference for your records</p>
            </div>

            {/* Purchase Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  {isBookPurchase ? (
                    <>
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      Purchase Details
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5 text-amber-600" />
                      Ticket Details
                    </>
                  )}
                </h3>
                <div className="space-y-3">
                  {isTicketPurchase && orderDetails && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">Tickets</span>
                      <span className="font-semibold text-slate-800">
                        {orderDetails.quantity}x @ £25.00
                      </span>
                    </div>
                  )}
                  {isBookPurchase && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">{orderDetails?.quantity || 1}x Build Wealth Through Property</span>
                      <span className="font-semibold text-slate-800">£{(((orderDetails?.quantity || 1) * 19.99)).toFixed(2)}</span>
                    </div>
                  )}
                  {isBookPurchase && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                      <span className="text-slate-600">UK Shipping</span>
                      <span className="font-semibold text-slate-800">£4.99</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-slate-800 text-lg">Total Paid</span>
                    <span className="font-bold text-2xl text-amber-600">
                      £{orderDetails ? (orderDetails.amount_total / 100).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event/Shipping Details */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  {isBookPurchase ? (
                    <>
                      <MapPin className="w-5 h-5 text-amber-600" />
                      Shipping Address
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 text-amber-600" />
                      Event Details
                    </>
                  )}
                </h3>
                <div className="space-y-3 text-sm">
                  {isTicketPurchase ? (
                    <>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Friday, 14 March 2026</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>2:00 PM – 5:00 PM (Doors open 1:15 PM)</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>Atrium, Methodist College Belfast</span>
                      </div>
                    </>
                  ) : (
                    orderDetails && (
                      <>
                        <div className="text-slate-600">
                          <p className="font-medium text-slate-800 mb-1">Delivery Address</p>
                          <p>{orderDetails.shipping_address}</p>
                          <p>{orderDetails.shipping_city}</p>
                          <p>{orderDetails.shipping_postcode}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200 text-slate-500">
                          <p className="text-xs">Expected delivery: 5-7 business days</p>
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Email */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Confirmation Email Sent</h4>
                  <p className="text-sm text-blue-700">
                    A detailed confirmation email has been sent to{' '}
                    <strong className="text-blue-900">{orderDetails?.customer_email || 'your email address'}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {isTicketPurchase 
                      ? 'Please bring your order reference or confirmation email to the event for check-in.'
                      : 'You will receive a shipping confirmation email once your order is dispatched.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Charity Message for Books */}
            {isBookPurchase && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-rose-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-rose-900 mb-2 flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      100% of Proceeds to Charity
                    </h4>
                    <p className="text-sm text-rose-700">
                      Thank you for your purchase! All proceeds from this book sale go directly to{' '}
                      <strong className="text-rose-900">Place of Victory Charity</strong>, supporting their 
                      mission to secure a permanent community location.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="flex-1 group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {isTicketPurchase && (
                <button
                  onClick={() => window.print()}
                  className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Print Receipt
                </button>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
              {isBookPurchase ? 'What Happens Next?' : 'What to Expect'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {isTicketPurchase ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Bring Your Reference</h3>
                      <p className="text-slate-300 text-sm">
                        Present your order reference or confirmation email at the event for check-in.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Arrive Early</h3>
                      <p className="text-slate-300 text-sm">
                        Doors open at 1:15 PM. Arrive early to secure your preferred seating.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Check Your Email</h3>
                      <p className="text-slate-300 text-sm">
                        We'll send you event updates and reminders as the date approaches.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Support Charity</h3>
                      <p className="text-slate-300 text-sm">
                        Consider purchasing the book at the event to support Place of Victory Charity.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Confirmation</h3>
                      <p className="text-slate-300 text-sm">
                        You'll receive a shipping confirmation email once your order is dispatched.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Delivery Time</h3>
                      <p className="text-slate-300 text-sm">
                        Your book will arrive within 5-7 business days via Royal Mail.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Charity Impact</h3>
                      <p className="text-slate-300 text-sm">
                        Your purchase directly supports Place of Victory Charity's community mission.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Start Learning</h3>
                      <p className="text-slate-300 text-sm">
                        Once you receive {orderDetails?.quantity && orderDetails.quantity > 1 ? `your ${orderDetails.quantity} books` : 'your book'}, dive into the 7 core principles of property investment.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;

