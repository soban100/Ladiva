import { Truck, Clock, Package, Shield } from 'lucide-react';

export const ShippingInfo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shipping Information</h1>
          <p className="text-gray-600 mb-8">Everything you need to know about our shipping policies.</p>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Delivery Options</h2>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Standard Delivery</h3>
                  <p className="text-gray-600">3-5 business days</p>
                  <p className="text-gray-600">PKR 150</p>
                </div>
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Express Delivery</h3>
                  <p className="text-gray-600">1-2 business days</p>
                  <p className="text-gray-600">PKR 300</p>
                </div>
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                  <p className="text-gray-600">On orders above PKR 5,000</p>
                  <p className="text-gray-600">5-7 business days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Processing Time</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Orders are processed within 1-2 business days. You will receive a confirmation email once your order has been shipped.
              </p>
              <p className="text-gray-600">
                Processing time may be longer during peak seasons or holidays.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Package className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Shipping Areas</h2>
              </div>
              <p className="text-gray-600 mb-4">
                We currently ship to all major cities in Pakistan including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Lahore, Karachi, Islamabad</li>
                <li>Faisalabad, Rawalpindi, Multan</li>
                <li>Peshawar, Quetta, Sialkot</li>
                <li>And all other major cities</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-gray-900">Tracking Your Order</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Once your order is shipped, you will receive a tracking number via email. You can use this number to track your package on our website or the courier's website.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Delivery times are estimates and may vary
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  We are not responsible for delays caused by courier services
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Please ensure your address is correct when placing an order
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  Someone must be available to receive the package
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
