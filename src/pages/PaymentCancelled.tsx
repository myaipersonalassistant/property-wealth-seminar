import React from 'react';
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw,
  CreditCard,
  HelpCircle,
  Mail,
  Home,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentCancelled: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      <Header variant="solid" showBookButton={false} />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cancelled Hero Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto border-4 border-red-300">
                <XCircle className="w-14 h-14 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
              Payment Cancelled
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              No charges have been made to your account
            </p>
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 rounded-full px-4 py-2 text-sm font-semibold border border-red-200">
              <AlertTriangle className="w-4 h-4" />
              Transaction Cancelled
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 mb-8 border-2 border-red-100">
            {/* Info Section */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-2">What Happened?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    You cancelled the payment process before completing your purchase. Your payment method 
                    was not charged, and no order was created. You can try again at any time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-2">Your Payment is Safe</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    No payment information was stored, and no charges were made. Your card details are 
                    processed securely by Stripe and never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Common Reasons */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 mb-4">Common Reasons for Cancellation</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Changed your mind</p>
                    <p className="text-xs text-slate-600">That's okay! Take your time to decide.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Payment method issue</p>
                    <p className="text-xs text-slate-600">Try using a different card or payment method.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Need more information</p>
                    <p className="text-xs text-slate-600">Check our FAQ or contact us for assistance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                to="/booking"
                className="group w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Booking Again
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/"
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
                <Link
                  to="/book"
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  View Book Options
                </Link>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Need Help?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-slate-300 text-sm">
                    If you experienced any issues during checkout, please reach out to us through the 
                    contact information provided during the booking process.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Check Our FAQ</h3>
                  <p className="text-slate-300 text-sm">
                    Many common questions are answered in our FAQ section. You can find information about 
                    tickets, refunds, and the event.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/#faq"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-semibold"
              >
                View FAQ Section
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelled;

