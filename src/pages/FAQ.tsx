import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse our products, select the items you want, choose your size and color, add them to your cart, and proceed to checkout. You'll need to provide your shipping information and payment details to complete the purchase."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard), debit cards, JazzCash, EasyPaisa, and cash on delivery (COD) for orders within Pakistan."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-5 business days, express delivery takes 1-2 business days, and free shipping (on orders above PKR 5,000) takes 5-7 business days."
    },
    {
      question: "Can I track my order?",
      answer: "Yes! Once your order is shipped, you'll receive a tracking number via email. You can use this to track your package on our website or the courier's website."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in original condition with tags intact. Sale items are final and cannot be returned."
    },
    {
      question: "How do I return an item?",
      answer: "Contact us at returns@ladiva.com with your order number. We'll send you a prepaid shipping label. Pack the item securely and ship it back. Refunds are processed within 5-7 business days after inspection."
    },
    {
      question: "Can I exchange an item for a different size?",
      answer: "Yes, you can exchange items for different sizes or colors within 7 days of delivery, subject to availability. Contact us to initiate an exchange."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within Pakistan. We're working on expanding our shipping options to international destinations in the future."
    },
    {
      question: "How do I know my size?",
      answer: "Each product page includes a size chart with measurements in inches and centimeters. We recommend measuring yourself and referring to the chart before ordering."
    },
    {
      question: "What if my order is damaged or defective?",
      answer: "If you receive a damaged or defective item, please contact us immediately at support@ladiva.com with photos of the damage. We'll arrange a free replacement or full refund."
    },
    {
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 24 hours of placement. After that, once the order has been processed and shipped, it cannot be cancelled. You can return the item following our return policy."
    },
    {
      question: "Do you offer gift cards?",
      answer: "Yes, we offer digital gift cards in various denominations. They make perfect gifts and can be redeemed on any purchase on our website."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions about our products and services.</p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-pink-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-pink-500" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-pink-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Still have questions?</h2>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Our customer service team is here to help.
            </p>
            <a
              href="/contact-us"
              className="inline-block bg-pink-500 text-white py-3 px-8 rounded-md hover:bg-pink-600 transition font-semibold"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
