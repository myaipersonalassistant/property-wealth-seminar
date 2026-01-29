import React from 'react';
import { BookOpen, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Disclaimer: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header variant="solid" showBookButton={true} />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
              Disclaimer
            </h1>
            <p className="text-slate-600 text-lg">
              Important information regarding seminar bookings, book purchases, and property investment
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 space-y-8">
            {/* General Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-600" />
                General Information
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  This website is designed to provide information about the "Build Wealth Through Property" 
                  seminar and related book. The information contained on this website is for general 
                  informational purposes only and should not be construed as financial, legal, or investment 
                  advice.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  By using this website, booking seminar tickets, or purchasing the book, you acknowledge 
                  that you have read, understood, and agree to be bound by this disclaimer.
                </p>
              </div>
            </section>

            {/* Seminar Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Seminar Bookings</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  Seminar tickets are sold for educational and informational purposes only. The seminar 
                  content is based on the personal experiences and opinions of the host and panel members. 
                  Past performance and results are not indicative of future outcomes.
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Tickets are non-refundable but may be transferable to another person</li>
                  <li>The seminar schedule, content, and panel members are subject to change without notice</li>
                  <li>Attendees are responsible for their own travel, accommodation, and related expenses</li>
                  <li>No guarantee is made regarding specific investment outcomes or financial results</li>
                </ul>
              </div>
            </section>

            {/* Book Purchase Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Book Purchases</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  The book "Build Wealth Through Property 7 Reasons Why" is sold for educational purposes. 
                  The information contained in the book reflects the author's personal experiences, opinions, 
                  and research at the time of publication.
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Book sales may be subject to availability and pricing may vary</li>
                  <li>All book proceeds from event sales are donated to Place of Victory Charity</li>
                  <li>The book does not constitute professional financial, legal, or tax advice</li>
                  <li>Readers should consult with qualified professionals before making investment decisions</li>
                </ul>
              </div>
            </section>

            {/* Investment Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Investment Risks</h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
                <p className="text-slate-800 font-semibold mb-2">Important Warning</p>
                <p className="text-slate-700 leading-relaxed">
                  Property investment carries significant financial risk. Property values can go down as well 
                  as up, and you may not get back the amount you invested. Market conditions, interest rates, 
                  and economic factors can all impact property investment returns.
                </p>
              </div>
              <div className="prose prose-slate max-w-none mt-4">
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>All investments carry risk, including the potential loss of capital</li>
                  <li>Property markets are subject to economic cycles and can be volatile</li>
                  <li>Mortgage and financing terms may change, affecting investment viability</li>
                  <li>Tax laws and regulations may change, impacting investment returns</li>
                  <li>Tenant-related issues, property maintenance, and legal obligations are ongoing responsibilities</li>
                  <li>Past performance is not a reliable indicator of future results</li>
                </ul>
              </div>
            </section>

            {/* No Professional Advice */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">No Professional Advice</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  The information provided on this website, in the seminar, and in the book does not 
                  constitute:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Financial advice or recommendations</li>
                  <li>Legal advice or guidance</li>
                  <li>Tax advice or planning</li>
                  <li>Mortgage or lending advice</li>
                  <li>Property valuation or market analysis</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-4">
                  You should always seek advice from qualified professionals (such as financial advisers, 
                  solicitors, accountants, and mortgage brokers) before making any investment decisions.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Limitation of Liability</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed mb-4">
                  To the fullest extent permitted by law, the website operator, seminar organisers, panel 
                  members, and all associated parties, and their respective agents, employees, and 
                  representatives:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Do not accept any liability for any loss or damage arising from the use of information 
                      provided on this website, in the seminar, or in the book</li>
                  <li>Do not guarantee the accuracy, completeness, or timeliness of any information provided</li>
                  <li>Are not responsible for any investment decisions made based on the information provided</li>
                  <li>Do not accept liability for any financial losses incurred as a result of property 
                      investment decisions</li>
                </ul>
              </div>
            </section>

            {/* External Links */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">External Links and Third Parties</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  This website may contain links to external websites or references to third-party services 
                  (such as Stripe for payments). We are not responsible for the content, privacy policies, 
                  or practices of any external websites or third-party services. Your use of such services 
                  is subject to their respective terms and conditions.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-3">Questions or Concerns?</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about this disclaimer or need clarification on any aspect of 
                the seminar or book, please contact us through the event booking system or the contact 
                information provided during the booking process.
              </p>
            </section>

            {/* Last Updated */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleDateString('en-GB', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Disclaimer;

