import { X, Package, Box, Tag, Banknote } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'out_of_stock';
  image: string;
}

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-success-100 text-success-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-warning-600';
    return 'text-success-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Image */}
          <div className="mb-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(product.status)}`}>
                  {product.status === 'active' ? 'Active' : 'Out of Stock'}
                </span>
                <span className="text-sm text-gray-500">ID: {product.id}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Banknote size={20} className="text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Price</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">Rs.{product.price.toLocaleString('ur-PK')}</p>
              </div>

              {/* Stock */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Box size={20} className="text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Stock Quantity</h4>
                </div>
                <p className={`text-2xl font-bold ${getStockColor(product.stock)}`}>
                  {product.stock} units
                </p>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Tag size={20} className="text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Category</h4>
                </div>
                <p className="text-lg font-medium text-gray-900 capitalize">{product.category}</p>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Package size={20} className="text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Availability</h4>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(product.status)}`}>
                  {product.status === 'active' ? 'Available for Sale' : 'Not Available'}
                </span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Inventory Status</h4>
              <p className="text-blue-800">
                {product.stock === 0 && 'This product is currently out of stock and cannot be sold.'}
                {product.stock > 0 && product.stock < 10 && `Low stock warning: Only ${product.stock} units remaining.`}
                {product.stock >= 10 && 'This product has sufficient stock levels.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
