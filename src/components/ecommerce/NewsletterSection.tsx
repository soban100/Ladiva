import React, { useState } from 'react';
import { Mail, Send, Sparkles, Gift } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotifications } from '../NotificationSystem';

export interface NewsletterSectionProps {
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
  heading?: string;
  description?: string;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  className = '',
  variant = 'default',
  heading = 'Stay in the Loop',
  description = 'Get exclusive offers, new product alerts, and 10% off your first order.'
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const { addNotification } = useNotifications();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Welcome to LADIVA! 🎉',
        message: 'Check your email for your 10% discount code.',
        duration: 5000
      });

      // Reset form
      setEmail('');
      setErrors({});
      
    } catch (error) {
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Subscription Failed',
        message: 'Please try again later.',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear email error when user starts typing
    if (errors.email && value.trim()) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-primary-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Get Exclusive Offers</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Subscribe for 10% off your first order</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                  } focus:outline-none focus:ring-2 transition-all duration-200`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 text-left">{errors.email}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
                loading={isLoading}
                className="whitespace-nowrap"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        );

      case 'featured':
        return (
          <div className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-100 dark:bg-secondary-900/30 rounded-full blur-2xl opacity-50"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{heading}</h3>
                  <div className="flex items-center text-sm text-primary-600 dark:text-primary-400 font-medium">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Limited Time Offer
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">{description}</p>
              
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm dark:shadow-gray-700/30 border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                          errors.email 
                            ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                        } focus:outline-none focus:ring-2 transition-all duration-200`}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1 text-left ml-2">{errors.email}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      loading={isLoading}
                      className="px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Subscribing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Subscribe
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Join 50,000+ subscribers. No spam, unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{heading}</h3>
                <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium mt-1">
                  <Sparkles className="w-5 h-5 mr-1" />
                  10% Off Your First Order
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto text-lg">{description}</p>
            
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm dark:shadow-gray-700/30 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email address"
                      className={`w-full px-5 py-4 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                        errors.email 
                          ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                      } focus:outline-none focus:ring-2 transition-all duration-200 text-lg`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-left ml-2">{errors.email}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    loading={isLoading}
                    className="px-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Subscribing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Subscribe Now
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  No spam
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Unsubscribe anytime
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                  Exclusive offers
                </div>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {renderContent()}
    </div>
  );
};
