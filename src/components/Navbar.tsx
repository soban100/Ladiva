import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronDown, Shirt, Gem, Home as HomeIcon, Sparkles, Tag, Package, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { FloatingCartPreview } from './ecommerce/FloatingCartPreview';
import { cn } from '../lib/utils';
import { fetchAllCategories } from '../services/categoryService';
import type { Category } from '../types';

const NavbarItem = ({ children, href, isActive = false, isScrolled = false }: { children: React.ReactNode; href?: string; isActive?: boolean; isScrolled?: boolean }) => {
  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          'relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100/50 hover:rounded-xl hover:shadow-lg hover:scale-105 hover:-translate-y-0.5',
          isActive ? 'text-primary-600 bg-primary-50 rounded-xl shadow-md' : (isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50')
        )}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <div className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100/50 hover:rounded-xl hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 cursor-pointer ${
      isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50'
    }`}>
      {children}
    </div>
  );
};

const MegaMenu = ({ isOpen, onMouseEnter, onMouseLeave, onClose }: { 
  isOpen: boolean; 
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchAllCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          console.error('Failed to fetch categories:', response.error);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Group categories by type (optional - you can customize this logic)
  const groupedCategories = {
    fashion: categories.filter(cat => ['clothing', 'footwear', 'accessories'].includes(cat.slug)),
    luxury: categories.filter(cat => ['jewelry', 'bags', 'watches'].includes(cat.slug)),
    lifestyle: categories.filter(cat => ['home-living', 'beauty', 'electronics'].includes(cat.slug))
  };

  const categoryGroups = [
    {
      title: 'Fashion',
      icon: Shirt,
      items: groupedCategories.fashion.map(cat => ({
        name: cat.name,
        href: `/category/${cat.slug}`,
        description: cat.description || `Shop ${cat.name.toLowerCase()}`
      }))
    },
    {
      title: 'Luxury',
      icon: Gem,
      items: groupedCategories.luxury.map(cat => ({
        name: cat.name,
        href: `/category/${cat.slug}`,
        description: cat.description || `Shop ${cat.name.toLowerCase()}`
      }))
    },
    {
      title: 'Lifestyle',
      icon: HomeIcon,
      items: groupedCategories.lifestyle.map(cat => ({
        name: cat.name,
        href: `/category/${cat.slug}`,
        description: cat.description || `Shop ${cat.name.toLowerCase()}`
      }))
    }
  ];

  // Add remaining categories that don't fit in groups
  const otherCategories = categories.filter(cat => 
    !groupedCategories.fashion.includes(cat) && 
    !groupedCategories.luxury.includes(cat) && 
    !groupedCategories.lifestyle.includes(cat)
  );

  if (otherCategories.length > 0) {
    categoryGroups.push({
      title: 'More Categories',
      icon: Tag,
      items: otherCategories.map(cat => ({
        name: cat.name,
        href: `/category/${cat.slug}`,
        description: cat.description || `Shop ${cat.name.toLowerCase()}`
      }))
    });
  }

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-5xl bg-white/90 backdrop-blur-xl border border-gray-100/50 shadow-2xl rounded-2xl mt-2"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          ) : (
            categoryGroups.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {category.items.length > 0 ? (
                      category.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          to={item.href}
                          onClick={onClose}
                          className="block group"
                        >
                          <div className="p-3 rounded-xl hover:bg-gray-800/10 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <h4 className="font-medium text-gray-900 group-hover:text-gray-900 transition-colors relative z-10">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-700 transition-colors relative z-10">{item.description}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No categories in this group</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Featured Section */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 text-primary-500 mr-2" />
                Featured Collections
              </h4>
              <p className="text-sm text-gray-500 mt-1">Discover our curated selections</p>
            </div>
            <Link to="/products" onClick={onClose}>
              <Button
                variant="primary"
                size="sm"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Category List Component
const MobileCategoryList = ({ setIsMenuOpen }: { setIsMenuOpen: (open: boolean) => void }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchAllCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          console.error('Failed to fetch categories:', response.error);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="pl-4 space-y-1">
        <div className="px-4 py-2 text-sm text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="pl-4 space-y-1">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const { signOut } = useAuth();
  const location = useLocation();

  // Calculate cart count from all items (localStorage only, no user filtering)
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'fixed top-4 left-4 right-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-2xl border border-gray-100/50 scale-[0.98]' 
          : 'bg-transparent backdrop-blur-none shadow-none border-none'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                LADIVA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavbarItem href="/" isActive={isActivePath('/')} isScrolled={isScrolled}>
                Home
              </NavbarItem>
              
              <NavbarItem href="/products" isActive={isActivePath('/products')} isScrolled={isScrolled}>
                Products
              </NavbarItem>
              
              {/* Mega Menu */}
              <div 
                className="relative"
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
              >
                <div className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100/50 hover:rounded-xl hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 cursor-pointer ${
                  isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                }`}>
                  <span>Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                    isMegaMenuOpen ? 'rotate-180' : ''
                  } text-gray-700`} />
                </div>
                <MegaMenu 
  isOpen={isMegaMenuOpen} 
  onMouseEnter={handleMegaMenuEnter}
  onMouseLeave={handleMegaMenuLeave}
  onClose={() => setIsMegaMenuOpen(false)} 
/>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Cart */}
              <FloatingCartPreview>
                <Link to="/cart" className="relative group">
                  <div className="p-2 rounded-xl hover:bg-gray-800/10 hover:shadow-xl hover:scale-110 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors relative z-10" />
                  </div>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary-400 to-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </FloatingCartPreview>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <div className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-800/10 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-400 relative z-10"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center relative z-10">
                        <span className="text-white text-sm font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors relative z-10" />
                  </div>
                  
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50/70 to-white">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="mt-1 flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 p-2 bg-gray-50/60">
                      <button
                        onClick={signOut}
                        className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<User className="w-4 h-4" />}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-800/10 hover:shadow-xl hover:scale-110 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isMenuOpen ? <X className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors relative z-10" /> : <Menu className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors relative z-10" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`lg:hidden fixed inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg z-40 overflow-y-auto ${
          isScrolled ? 'top-20' : 'top-16'
        }`}>
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link
                to="/"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActivePath('/') ? 'text-primary-600 bg-primary-50' : (isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50')
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link
                to="/products"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActivePath('/products') ? 'text-primary-600 bg-primary-50' : (isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50')
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              {/* Mobile Categories */}
              <div className="space-y-2">
                <button
                  className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    isMegaMenuOpen ? 'rotate-180' : ''
                  } ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300'}`} />
                </button>
                
                {isMegaMenuOpen && (
                  <MobileCategoryList setIsMenuOpen={setIsMenuOpen} />
                )}
              </div>
            </div>

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-6">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary-400"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="primary" fullWidth>
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
