import React, { useEffect, useState } from 'react';
import { Check, Calendar, Clock, MapPin, Download, Mail, Ticket, ArrowRight, Loader2 } from 'lucide-react';
import { getTicketPurchase } from '@/lib/firestore';

interface PaymentSuccessProps {
  sessionId: string | null;
  orderRef: string | null;
  onClose: () => void;
}

interface OrderDetails {
  customer_name: string;
  customer_email: string;
  quantity: number;
  amount_total: number;
  order_reference: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ sessionId, orderRef, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderRef) {
        try {
          const data = await getTicketPurchase(orderRef);
          if (data) {
            setOrderDetails(data);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      }
      setIsLoading(false);
    };

    // Small delay to allow webhook to process
    setTimeout(fetchOrderDetails, 1500);
  }, [orderRef]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-green-100">Your tickets have been secured</p>
        </div>

        <div className="p-6">
          {/* Order Reference */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-slate-500 mb-1">Order Reference</p>
            <p className="font-mono text-xl font-bold text-slate-800">
              {orderRef || orderDetails?.order_reference || 'BWP-XXXXXXXX'}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="space-y-4 mb-6">
            {orderDetails && (
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Tickets</span>
                <span className="font-semibold text-slate-800">
                  {orderDetails.quantity}x @ £25.00
                </span>
              </div>
            )}
            {orderDetails && (
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Total Paid</span>
                <span className="font-bold text-lg text-amber-600">
                  £{(orderDetails.amount_total / 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-600" />
              Event Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Saturday, 14 March 2026</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>2:00 PM – 5:00 PM (Doors open 1:15 PM)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Europa Hotel, Great Victoria Street, Belfast BT2 7AP</span>
              </div>
            </div>
          </div>

          {/* Confirmation Email Notice */}
          <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 mb-6">
            <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Confirmation Email Sent</p>
              <p className="text-sm text-blue-600">
                A confirmation email with your ticket details has been sent to{' '}
                <strong>{orderDetails?.customer_email || 'your email address'}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              Continue to Event Page
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Please bring your order reference or confirmation email to the event for check-in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
