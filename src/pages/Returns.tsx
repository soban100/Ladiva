import { RotateCcw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const Returns = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
          <p className="text-gray-600 mb-8">Our return policy is designed to ensure your satisfaction.</p>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <RotateCcw className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Return Policy</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within <strong>7 days</strong> of delivery.
                </p>
                <div className="bg-pink-50 p-4 rounded-md">
                  <p className="font-semibold text-gray-900">Return Conditions:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Items must be unworn, unwashed, and in original condition</li>
                    <li>Original tags and packaging must be intact</li>
                    <li>Proof of purchase is required</li>
                    <li>Sale items are final and cannot be returned</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Non-Returnable Items</h2>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Personal care items (cosmetics, skincare)
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Intimate apparel (lingerie, swimwear)
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Items marked as "Final Sale"
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Customized or personalized items
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">How to Return</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Contact Us</h3>
                    <p className="text-gray-600">Email us at returns@ladiva.com with your order number</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Receive Return Label</h3>
                    <p className="text-gray-600">We'll send you a prepaid shipping label</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pack & Ship</h3>
                    <p className="text-gray-600">Pack the item securely and attach the label</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Receive Refund</h3>
                    <p className="text-gray-600">Refund processed within 5-7 business days after inspection</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Refund Process</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  Refunds will be processed to the original payment method used for the purchase.
                </p>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="font-semibold text-gray-900">Refund Timeline:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Inspection: 1-2 business days after receipt</li>
                    <li>Processing: 2-3 business days</li>
                    <li>Bank/Credit Card: 5-7 additional business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exchange Policy</h2>
              <p className="text-gray-600 mb-4">
                If you'd like to exchange an item for a different size or color, please contact us within 7 days of delivery. We'll be happy to help you find the perfect fit.
              </p>
              <p className="text-gray-600">
                Exchanges are subject to availability. If the item is unavailable, we'll offer a store credit or refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
