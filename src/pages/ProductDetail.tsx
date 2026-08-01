import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Minus, Plus, Truck, Shield, ArrowLeft, Zap, ShoppingCart, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite } from '../store/favoritesSlice';
import { useProduct } from '../hooks/useProducts';
import { formatPrice, getDisplayPrice, getDiscountPercentage } from '../utils/productUtils';
import { useCartActions } from '../hooks/useCartActions';
import { useToast } from '../contexts/ToastContext';
import { getGuestId } from '../utils/cartHelper';


export const ProductDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const { items: favorites } = useAppSelector((state) => state.favorites);
  const { error: showError } = useToast();
  const { addToCart } = useCartActions();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showGoToCart, setShowGoToCart] = useState(false);

  const currentGuestId = getGuestId();

  // Fetch product using React Query
  const { data: productData, isLoading, error } = useProduct(id || '');
  const product = productData?.data || null;

  // Filter cart items based on user (logged-in or guest)
  const userCartItems = items.filter(item => 
    item.user_id === (user?.id || currentGuestId)
  );

  const cartItemsCount = userCartItems.reduce((total, item) => total + item.quantity, 0);

  // Set default selections when product loads
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      setIsWishlisted(favorites.includes(id || ''));
    }
  }, [product, selectedSize, selectedColor, favorites, id]);

  const handleToggleFavorite = () => {
    if (!product) return;
    dispatch(toggleFavorite(product.id));
    setIsWishlisted(!isWishlisted);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    // Only check minimum quantity, allow unlimited for NULL stock
    if (newQuantity >= 1 && (product === null || product.stock === null || newQuantity <= product.stock)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Validation: Check if size is required and selected
    if (product.sizes && product.sizes.length > 1 && !selectedSize) {
      showError('Selection Required', 'Please select a size before adding to cart.');
      return;
    }
    
    // Validation: Check if color is required and selected
    if (product.colors && product.colors.length > 1 && !selectedColor) {
      showError('Selection Required', 'Please select a color before adding to cart.');
      return;
    }
    
    // Validation: Check stock (only for managed stock)
    if (product.stock === 0) {
      showError('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    
    // Validation: Check requested quantity vs available stock (only for managed stock)
    if (product.stock !== null && quantity > product.stock) {
      showError('Insufficient Stock', `Only ${product.stock} items available in stock.`);
      return;
    }
    
    setAddingToCart(true);
    
    try {
      await addToCart({
        product,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined
      });
      
      // Show Go to Cart button
      setShowGoToCart(true);
      
      // Reset quantity after adding to cart
      setQuantity(1);
      
      // Hide Go to Cart button after 5 seconds
      setTimeout(() => {
        setShowGoToCart(false);
      }, 5000);
    } catch (error) {
      // Error handling is done by useToast
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {error?.message || 'Product Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error?.message || 'The product you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = getDisplayPrice(product);
  const hasDiscount = product.discount_price && product.discount_price > 0;
  const discount = getDiscountPercentage(product.price, displayPrice);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 relative">
      {/* Floating Cart Button */}
      <Link
        to="/cart"
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-pink-500/50 transition-all duration-300 group"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-pink-600 rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
              {cartItemsCount}
            </span>
          )}
        </div>
      </Link>
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors p-2 rounded-xl hover:bg-gray-800/10 dark:hover:bg-gray-700/20 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10" />
              <span className="relative z-10 dark:text-gray-300">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-xl hover:bg-gray-800/10 hover:shadow-lg hover:scale-110 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart
                  className={`w-5 h-5 transition-colors relative z-10 ${
                    isWishlisted 
                      ? 'text-red-500 fill-current group-hover:text-red-600' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg dark:shadow-gray-700/50 hover:shadow-2xl dark:hover:shadow-gray-700 transition-all duration-300">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=No+Image';
                }}
              />
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow dark:shadow-gray-700/50 hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 cursor-pointer">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=No+Image';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {discount > 0 && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>{discount}% OFF</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 fill-current text-gray-300"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-200">4.5</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">(12 reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  product.stock === null ? 'bg-green-500' :
                  product.stock > 10 ? 'bg-green-500' : 
                  product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                <p className={`text-sm font-medium ${
                  product.stock === null ? 'text-green-600 dark:text-green-400' :
                  product.stock > 10 ? 'text-green-600 dark:text-green-400' : 
                  product.stock > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {product.stock === null ? 'In Stock' :
                   product.stock > 10 ? 'In Stock' : 
                   product.stock > 0 ? `Only ${product.stock} left in stock` : 
                   'Out of Stock'}
                </p>
              </div>
            </div>

            {product.description && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                  Size
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 hover:scale-105 ${
                        selectedSize === size
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                  Color
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 hover:scale-105 ${
                        selectedColor === color
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                Quantity
              </h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hover:shadow-lg text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 min-w-[80px] text-center font-semibold text-lg text-gray-900 dark:text-gray-100">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hover:shadow-lg text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {product.stock === null ? 'Unlimited available' : `${product.stock} available`}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 relative overflow-hidden group"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : product.stock === 0 ? (
                  <>
                    <span>Out of Stock</span>
                  </>
                ) : (
                  <>
                    <span>Add to Cart</span>
                    <Plus className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {/* Go to Cart Button - appears after successful addition */}
              {showGoToCart && (
                <button
                  onClick={handleGoToCart}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 relative overflow-hidden group"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Go to Cart</span>
                </button>
              )}
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Free Shipping</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">On orders over Rs.5,000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Fast Shipping</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Secure Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">100% secure transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
