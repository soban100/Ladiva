import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/layout';
import { motion } from 'framer-motion';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn, isCheckingRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    };

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  // Remove the useEffect that was causing race conditions
  // Navigation now happens synchronously after signIn returns

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // signIn now handles role checking and returns isAdmin
      const { error: signInError, isAdmin } = await signIn(email, password);

      console.log('🔍 Login redirect check:', { email, isAdmin, signInError });

      if (signInError) {
        setLoading(false);
        return;
      }

      // Navigation based on role - immediate redirect after signIn returns
      if (isAdmin) {
        console.log('✅ Redirecting to ADMIN panel (/admin)');
        navigate('/admin', { replace: true });
      } else {
        console.log('⚠️ Redirecting to USER panel (/) - isAdmin is false');
        navigate('/', { replace: true });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Show loading state when checking authorization
  if (isCheckingRole || (loading && !error)) {
    return (
      <Container className="min-h-screen flex items-center justify-center py-12">
        <Card variant="elevated" className="max-w-md w-full p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Checking Authorization...</h3>
              <p className="mt-2 text-white">Please wait while we verify your account</p>
            </div>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 text-white border border-gray-700">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                LADIVA
              </h2>
              <p className="mt-2 text-lg text-gray-300">Welcome back! Login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-lg text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-200">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 text-black placeholder-gray-500 ${
                      errors.email 
                        ? 'border-error-500 ring-4 ring-error-100' 
                        : isFocused.email 
                          ? 'border-primary-500 ring-4 ring-primary-100' 
                          : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none`}
                    placeholder="Enter your email"
                  />
                  {isFocused.email && !errors.email && (
                    <div className="absolute right-3 top-3.5 text-primary-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 text-black placeholder-gray-500 ${
                      errors.password 
                        ? 'border-error-500 ring-4 ring-error-100' 
                        : isFocused.password 
                          ? 'border-primary-500 ring-4 ring-primary-100' 
                          : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full py-4 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              <p className="text-center text-sm text-gray-300">
                Don't have an account?{' '}
                <Link 
                  to="/signin" 
                  className="font-semibold hover:underline transition-all duration-200 text-primary-600 hover:text-primary-700"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Half - Animation Area */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Container for Phase 3: Both elements move up and scale together */}
          <motion.div
            initial={{ y: 0, scale: 1 }}
            animate={{ y: -20, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
          >
            {/* Phase 1: "Welcome to" animates from left to center (0.3s) */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1 className="text-5xl font-bold text-gray-200">Welcome to</h1>
            </motion.div>

            {/* Phase 2: "Ladiva" reveals underneath after Phase 1 completes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mt-2">
                Ladiva
              </h2>
            </motion.div>
          </motion.div>

          {/* Phase 4: "Thanks for choosing us" fades in underneath as they move up */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            className="mt-4"
          >
            <p className="text-xl text-gray-400">Thanks for choosing us</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
