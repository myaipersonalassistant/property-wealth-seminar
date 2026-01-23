import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is this suitable for beginners?",
    answer: "Yes. The content is designed to be clear, practical, and accessible, even if you have never invested in property before. Chris explains each concept from the ground up with real-world examples."
  },
  {
    question: "Will I be able to ask questions?",
    answer: "Yes. There will be a live Q&A session with both the host and the expert panel. You'll have the opportunity to get specific answers to your property investment questions."
  },
  {
    question: "Will the book be available at the event?",
    answer: "Yes. The book will be available for purchase on the day, and all book proceeds will go to Place of Victory Charity to support their community programmes."
  },
  {
    question: "Is parking available at the venue?",
    answer: "Yes, parking is available at or near Methodist College Belfast. Please arrive early to allow time for registration and finding a parking space."
  },
  {
    question: "Can I get a refund if I can't attend?",
    answer: "Tickets are non-refundable, but they are transferable. If you cannot attend, you may give or sell your ticket to someone else. Please notify us of any name changes."
  },
  {
    question: "What should I bring to the event?",
    answer: "We recommend bringing a notebook and pen for taking notes. You may also want to bring business cards for networking with other attendees and the expert panel."
  },
  {
    question: "Is this a sales pitch for a property course?",
    answer: "No. This is a genuine educational seminar based on real experience. There are no upsells or high-pressure sales tactics. The focus is on providing practical value and supporting charity."
  },
  {
    question: "Will the event be recorded?",
    answer: "The event will not be live-streamed or recorded for public distribution. This is an exclusive in-person experience designed for attendees only."
  }
];

const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div 
          key={index}
          className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-800">{faq.question}</span>
            <ChevronDown 
              className={`w-5 h-5 text-amber-600 flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <p className="px-6 pb-5 text-slate-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
